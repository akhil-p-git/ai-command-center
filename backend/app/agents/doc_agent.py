import time
from typing import TypedDict, Optional, List, Annotated
from operator import add
from sqlalchemy.orm import Session

from langgraph.graph import StateGraph, START, END
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

from app.agents.base import BaseAgent
from app.core.config import settings


class DocAgentState(TypedDict):
    """State for the DocAgent"""
    query: str
    retrieved_docs: Annotated[List[str], add]
    context: str
    response: str


class DocAgent(BaseAgent):
    """RAG agent for answering questions from documents"""

    def __init__(self):
        super().__init__("doc", "DocAgent")
        self._db: Optional[Session] = None
        self._conversation_id: Optional[str] = None

    def _create_graph(self):
        """Create the LangGraph workflow"""
        graph = StateGraph(DocAgentState)

        # Add nodes
        graph.add_node("retrieve_docs", self._retrieve_docs)
        graph.add_node("generate_response", self._generate_response)

        # Add edges
        graph.add_edge(START, "retrieve_docs")
        graph.add_edge("retrieve_docs", "generate_response")
        graph.add_edge("generate_response", END)

        return graph.compile()

    async def _retrieve_docs(self, state: DocAgentState) -> dict:
        """Retrieve relevant documents from vector store"""
        start = time.perf_counter()
        query = state["query"]

        # Use vector store
        try:
            from app.services import vector_store
            results = vector_store.query_collection("project-docs", query, n_results=3)
            docs = [r["content"] for r in results]
        except Exception as e:
            print(f"Vector store query failed: {e}")
            docs = []

        if not docs:
            # Fallback to simple keyword search in database
            from app.models import KnowledgeChunk
            chunks = self._db.query(KnowledgeChunk).filter(
                KnowledgeChunk.content.ilike(f"%{query.split()[0]}%")
            ).limit(3).all()
            docs = [c.content for c in chunks] if chunks else [
                "No relevant documents found. Please provide more context or try a different query."
            ]

        duration = int((time.perf_counter() - start) * 1000)
        self._log_step(
            "retrieve_docs",
            "completed",
            duration,
            input_preview=query,
            output_preview=f"Retrieved {len(docs)} documents"
        )

        context = "\n\n---\n\n".join(docs)
        return {"retrieved_docs": docs, "context": context}

    async def _generate_response(self, state: DocAgentState) -> dict:
        """Generate response using Claude"""
        start = time.perf_counter()

        if not settings.ANTHROPIC_API_KEY:
            # Return mock response if no API key
            response = f"[Mock Response] Based on the retrieved documents about '{state['query']}', here is a synthesized answer. In production, this would use Claude to generate a contextual response based on the retrieved documents."
            duration = int((time.perf_counter() - start) * 1000)
            self._log_step(
                "generate_response",
                "completed",
                duration,
                input_preview=state.get("context", "")[:100],
                output_preview=response[:100]
            )
            return {"response": response}

        llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            api_key=settings.ANTHROPIC_API_KEY,
            max_tokens=1024
        )

        system_prompt = """You are a helpful AI assistant that answers questions based on the provided context.
Use only the information from the context to answer. If the context doesn't contain relevant information, say so.
Be concise and direct in your responses."""

        context = state.get("context", "No context available")
        query = state["query"]

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Context:\n{context}\n\nQuestion: {query}")
        ]

        response = await llm.ainvoke(messages)

        # Track tokens
        if hasattr(response, 'usage_metadata'):
            self._track_tokens(
                "claude-3-5-sonnet-20241022",
                response.usage_metadata.get('input_tokens', 0),
                response.usage_metadata.get('output_tokens', 0),
                self._conversation_id,
                self._db
            )

        duration = int((time.perf_counter() - start) * 1000)
        self._log_step(
            "generate_response",
            "completed",
            duration,
            input_preview=f"Query: {query}",
            output_preview=response.content[:100]
        )

        return {"response": response.content}

    async def _execute(
        self,
        input_text: str,
        conversation_id: Optional[str],
        db: Session
    ) -> str:
        """Execute the DocAgent workflow"""
        self._db = db
        self._conversation_id = conversation_id

        graph = self._create_graph()

        initial_state = {
            "query": input_text,
            "retrieved_docs": [],
            "context": "",
            "response": ""
        }

        result = await graph.ainvoke(initial_state)
        return result["response"]
