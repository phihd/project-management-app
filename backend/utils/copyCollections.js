const config = require('./config')
const { MongoClient } = require('mongodb')

const uri = config.MONGODB_CLUSTER_URI
const sourceDbName = 'projectApp'
const targetDbName = 'testProjectApp'

async function copyDatabase() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

  try {
    await client.connect()
    console.log('Connected to the database.')

    const sourceDb = client.db(sourceDbName)
    const targetDb = client.db(targetDbName)

    const collections = await sourceDb.listCollections().toArray()

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name
      const sourceCollection = sourceDb.collection(collectionName)
      const targetCollection = targetDb.collection(collectionName)

      // Drop the target collection if it exists
      const targetCollections = await targetDb.listCollections({ name: collectionName }).toArray()
      if (targetCollections.length > 0) {
        console.log(`Collection '${collectionName}' already exists in target database. Dropping it first.`)
        await targetCollection.drop()
      }

      // Copy documents from source to target collection
      const documents = await sourceCollection.find().toArray()
      if (documents.length > 0) {
        await targetCollection.insertMany(documents)
        console.log(`Copied ${documents.length} documents from '${collectionName}' in '${sourceDbName}' to '${targetDbName}'.`)
      } else {
        console.log(`No documents found in collection '${collectionName}'.`)
      }
    }
  } catch (err) {
    console.error('An error occurred:', err)
  } finally {
    await client.close()
    console.log('Database connection closed.')
  }
}

copyDatabase()
