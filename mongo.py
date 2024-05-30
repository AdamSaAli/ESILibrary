from bson.objectid import ObjectId
import pprint
from pymongo import MongoClient
from datetime import datetime

connection_string = "mongodb+srv://AdamAli123:EcoSisTime@cluster0.f6mndat.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client=MongoClient(connection_string)
db = client['fakeData']
collection = db['FakeCID']
#I will need to prompt the user to get their collection

def getCollection():
    
    collectionName = input("Enter your collection name: ")
    collection = db[collectionName]
    #this promts a user to enter the collection they would like to see
    #idk if we will even need this since i assume its just for us "under the hood"

    result = collection.find({})
    for x in result:
        print(x)
    return collection

#getCollection()
array_field = "Coord"

def getDocumentsWithCoords():
    matching_documents = collection.find({array_field: {"$nin": ["NULL"]}})
    #This finds all documents that have values for the Coord array
    for doc in matching_documents:
        print(doc)
    return matching_documents
#print('ahwdfiohasdnc')
#val = getDocumentsWithCoords()


obj_id_string="66588e0c23c4abda02dda107"
#I somehow need to get this on my own


realID = ObjectId(obj_id_string)
def getObjectID():
    val = collection.find_one({"_id":realID})
    print("AIJDFUIAHNFSCUIHNAUIFCBAWSFB")
    #for w in val:
    #    print(w)
    print(val)
    return val

#getObjectID()
#Get rid of any data that has coor as null

def getTime():
    time = realID.generation_time
    time_created = datetime.fromtimestamp(time.timestamp())
    print(time_created)

print("rfhagbdfhas")
getTime()

def getRecTime():
    return