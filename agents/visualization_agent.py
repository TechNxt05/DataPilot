import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

def auto_visualize(df: pd.DataFrame):
    """Automatically selects and generates charts based on dataframe shape/types.
    Returns a dictionary of plotly figures."""
    figures = {}
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    date_cols = df.select_dtypes(include=['datetime64', 'datetimetz']).columns.tolist()

    # 1. Bar chart / Pie chart for top categorical col
    if len(cat_cols) > 0:
        col = cat_cols[0]
        # limit top 10 categories
        top_cats = df[col].value_counts().nlargest(10).reset_index()
        top_cats.columns = [col, 'Count']
        fig_bar = px.bar(top_cats, x=col, y='Count', title=f"Top Categories in {col}", template='plotly_dark')
        figures['bar_chart'] = fig_bar

    # 2. Histogram / Distribution
    if len(numeric_cols) > 0:
        col = numeric_cols[0]
        fig_hist = px.histogram(df, x=col, title=f"Distribution of {col}", template='plotly_dark')
        figures['histogram'] = fig_hist

    # 3. Scatter plot / Correlation
    if len(numeric_cols) >= 2:
        fig_scatter = px.scatter(df, x=numeric_cols[0], y=numeric_cols[1], title=f"Scatter: {numeric_cols[0]} vs {numeric_cols[1]}", template='plotly_dark')
        figures['scatter_plot'] = fig_scatter
        
        # Correlation heatmap
        corr = df[numeric_cols].corr()
        fig_heatmap = px.imshow(corr, title="Correlation Heatmap", template='plotly_dark')
        figures['correlation_heatmap'] = fig_heatmap

    # 4. Box plot for numeric vs categorical
    if len(numeric_cols) > 0 and len(cat_cols) > 0:
        # only if cat col has few unique values
        if df[cat_cols[0]].nunique() <= 10:
            fig_box = px.box(df, x=cat_cols[0], y=numeric_cols[0], title=f"Boxplot of {numeric_cols[0]} by {cat_cols[0]}", template='plotly_dark')
            figures['box_plot'] = fig_box

    # 5. Line chart for time series
    if len(date_cols) > 0 and len(numeric_cols) > 0:
        time_df = df.sort_values(by=date_cols[0])
        fig_line = px.line(time_df, x=date_cols[0], y=numeric_cols[0], title=f"Trend of {numeric_cols[0]} over time", template='plotly_dark')
        figures['line_chart'] = fig_line

    return figures
