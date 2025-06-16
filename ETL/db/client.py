from pymongo import MongoClient, WriteConcern
from pymongo.server_api import ServerApi
from config.settings import settings

# Cliente global (lanzará excepción si la URI es errónea)
_client = MongoClient(
    settings.MONGO_URI,
    server_api=ServerApi("1"),
    retryWrites=True,
    tls=True,
)
_client.admin.command("ping")

db = _client[settings.DB_NAME]

raw_coll   = db.get_collection(settings.COLL_RAW,
                               write_concern=WriteConcern("majority"))
clean_coll = db.get_collection(settings.COLL_CLEAN,
                               write_concern=WriteConcern("majority"))
