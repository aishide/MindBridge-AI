from pymongo import MongoClient

client = MongoClient(
    "mongodb+srv://testuser:test123@mindbridgeai.qocqsdy.mongodb.net/?retryWrites=true&w=majority"
)

try:
    print(client.list_database_names())
    print("✅ MongoDB Connected Successfully")
except Exception as e:
    print("❌ Error:", e)