from langgraph.graph import StateGraph, START, END

from app.graph.state import AnalysisState
from app.graph.nodes import (
    infer_skills_node,
    create_vector_store_node,
    match_skills_node,
    deep_analysis_node
)


builder = StateGraph(AnalysisState)

builder.add_node("infer_skills", infer_skills_node)
builder.add_node("create_vector_store", create_vector_store_node)
builder.add_node("match_skills", match_skills_node)
builder.add_node("deep_analysis", deep_analysis_node)

builder.add_edge(START, "infer_skills")
builder.add_edge("infer_skills", "create_vector_store")
builder.add_edge("create_vector_store", "match_skills")
builder.add_edge("match_skills", "deep_analysis")
builder.add_edge("deep_analysis", END)

analysis_graph = builder.compile()