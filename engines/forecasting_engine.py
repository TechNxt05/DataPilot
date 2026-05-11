import pandas as pd
from prophet import Prophet
import logging

# Suppress prophet logs
logging.getLogger('prophet').setLevel(logging.WARNING)

class ForecastingEngine:
    def __init__(self):
        pass

    def run_forecast(self, df: pd.DataFrame, ds_col: str, y_col: str, periods: int = 30) -> pd.DataFrame:
        """
        Runs a forecast using Facebook Prophet.
        df: Input dataframe
        ds_col: Datetime column
        y_col: Value column
        periods: Number of days to forecast
        """
        # Prepare data for Prophet
        pdf = df[[ds_col, y_col]].copy()
        pdf.columns = ['ds', 'y']
        pdf['ds'] = pd.to_datetime(pdf['ds'])
        
        m = Prophet(daily_seasonality=True, yearly_seasonality=True)
        m.fit(pdf)
        
        future = m.make_future_dataframe(periods=periods)
        forecast = m.predict(future)
        
        return forecast

    def compare_models(self, df: pd.DataFrame, ds_col: str, y_col: str):
        # In a real system, this would benchmark Prophet vs XGBoost
        pass
