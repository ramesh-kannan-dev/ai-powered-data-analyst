import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

def load_data(file_path: str) -> pd.DataFrame:
    if file_path.endswith('.csv'):
        return pd.read_csv(file_path)
    elif file_path.endswith(('.xls', '.xlsx')):
        return pd.read_excel(file_path)
    raise ValueError("Unsupported file format")

def calculate_quality_score(df: pd.DataFrame) -> int:
    # A simple metric: penalizes missing values and extreme duplicates
    total_cells = df.size
    if total_cells == 0:
        return 0
    missing_cells = df.isnull().sum().sum()
    score = 100 - ((missing_cells / total_cells) * 100)
    return int(max(0, min(100, score)))

def detect_dataset_type(df: pd.DataFrame) -> str:
    cols = " ".join(df.columns).lower()
    if any(x in cols for x in ["price", "sale", "revenue", "cost", "customer", "order", "profit"]):
        return "Finance & Sales"
    elif any(x in cols for x in ["patient", "heart", "health", "symptom", "disease", "blood"]):
        return "Healthcare & Medicine"
    elif any(x in cols for x in ["user", "login", "session", "click", "web", "traffic"]):
        return "Web Analytics"
    return "General Operations"

def run_basic_ml(df: pd.DataFrame) -> dict:
    try:
        numeric_df = df.select_dtypes(include=[np.number]).dropna()
        if numeric_df.shape[1] < 2 or numeric_df.shape[0] < 5:
            return None
        
        corr = numeric_df.corr().abs()
        for i in range(len(corr)):
            corr.iloc[i, i] = 0
        
        if corr.max().max() < 0.1: 
           return None
            
        y_col = corr.max().idxmax()
        x_col = corr[y_col].idxmax()
        
        X = numeric_df[[x_col]].values
        y = numeric_df[y_col].values
        
        model = LinearRegression()
        model.fit(X, y)
        r2 = model.score(X, y)
        
        return {
            "model_type": "Linear Regression",
            "target": y_col,
            "predictor": x_col,
            "r2_score": round(r2, 4),
            "equation": f"y = {round(float(model.coef_[0]), 4)}x + {round(float(model.intercept_), 4)}"
        }
    except Exception as e:
        print(f"ML Processing Exception: {e}")
        return None

def process_dataset_summary(file_path: str) -> dict:
    df = load_data(file_path)
    
    # Basic shape
    rows, cols = df.shape
    
    # Missing values
    missing_values = df.isnull().sum().to_dict()
    
    # Data types
    data_types = df.dtypes.astype(str).to_dict()
    
    # Quality score
    quality_score = calculate_quality_score(df)
    
    # Basic numeric description
    numeric_df = df.select_dtypes(include=[np.number])
    stats = {}
    if not numeric_df.empty:
        desc = numeric_df.describe().to_dict()
        for col, s in desc.items():
            stats[col] = {"mean": s.get("mean"), "min": s.get("min"), "max": s.get("max"), "std": s.get("std")}
            
    return {
        "rows": rows,
        "columns": cols,
        "quality_score": quality_score,
        "missing_values": missing_values,
        "data_types": data_types,
        "stats": stats,
        "dataset_type": detect_dataset_type(df),
        "ml_model": run_basic_ml(df)
    }

def get_chart_data(file_path: str) -> dict:
    df = load_data(file_path)
    numeric_df = df.select_dtypes(include=[np.number])
    
    charts = {}
    
    # 1. Heatmap (Correlation)
    if not numeric_df.empty and numeric_df.shape[1] > 1:
        corr = numeric_df.corr().round(2)
        heatmap_data = []
        for col1 in corr.columns:
            for col2 in corr.columns:
                val = corr.loc[col1, col2]
                heatmap_data.append({"x": col1, "y": col2, "value": val if not pd.isna(val) else 0})
        charts["heatmap"] = heatmap_data
        
    # 2. Pie Chart (Distribution of Category)
    cat_df = df.select_dtypes(exclude=[np.number])
    if not cat_df.empty:
        best_col = None
        best_unique = 0
        for col in cat_df.columns:
            nunique = df[col].nunique()
            if 1 < nunique <= 10:
                if nunique > best_unique:
                    best_unique = nunique
                    best_col = col
        if best_col:
            val_counts = df[best_col].value_counts().head(5)
            pie_data = [{"name": str(k), "value": v} for k, v in val_counts.items()]
            charts["pie"] = {"column": best_col, "data": pie_data}
            
    # 3. Bar Chart (Histogram of top numeric feature)
    if not numeric_df.empty:
        col = numeric_df.columns[0]
        counts, bins = np.histogram(df[col].dropna(), bins=10)
        bar_data = [{"name": f"{bins[i]:.1f}", "value": int(counts[i])} for i in range(len(counts))]
        charts["bar"] = {"column": col, "data": bar_data}

    # 4. Line Chart (Time series assumed or index sequence for top numeric)
    if not numeric_df.empty:
        # Check if there's a datetime column
        date_cols = df.select_dtypes(include=['datetime', 'datetimetz']).columns
        time_col = None
        if len(date_cols) > 0:
            time_col = date_cols[0]
        
        y_col = numeric_df.columns[0]
        if time_col:
            # Group by time and take average
            ts_data = df.groupby(time_col)[y_col].mean().head(50)
            line_data = [{"name": str(k)[:10], "value": round(float(v), 2)} for k, v in ts_data.items()]
        else:
            # Just take first 50 rows
            line_data = [{"name": str(i), "value": round(float(v), 2)} for i, v in enumerate(df[y_col].head(50))]
        charts["line"] = {"column": y_col, "data": line_data}
        
    return charts
