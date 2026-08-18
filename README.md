Backend

How to Run the Backend

The backend is built using **Python Flask**. To run it locally:

1. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Start the Flask application:

   ```bash
   python app.py
   ```

3. Open the application in a web browser using the local address displayed by Flask, usually:

   ```text
   http://127.0.0.1:5000
   ```

#Database Used

The application uses **SQLite** as its database. SQLite stores the application's data in a local database file and is accessed by the Flask backend.

#Statistics API Endpoint

The backend provides an API endpoint for retrieving application statistics:

```text
GET /api/stats
```

The endpoint returns the statistics in JSON format so they can be displayed by the frontend.

#Retrieving Statistics from the Database

When `/api/stats` is requested, the Flask backend queries the SQLite database to retrieve the required statistics. The results are processed and returned as a JSON response. The frontend then uses this API response to display the statistics on the dashboard.
