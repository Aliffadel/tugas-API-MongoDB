const express = require("express")
const app = express()
const router = express.Router()
const client = require('./connection')
const db = client.db('hobby_list')
const ObjectId = require("mongodb").ObjectId

router.get('/api/hobby', async (req, res) => {
  try {
    // untuk connect ke database
    await client.connect();
    const hobbies = await db.collection('hobbies').find().toArray()
    if (hobbies.length > 0) {
      res.status(200).json({
        message: "Get List Hobbies Successfully",
        status: "success",
        data: hobbies
      })
    } else {
      res.status(200).json({
        message: "No Hobby List Found",
        status: "success",
        data: hobbies
      })
    }
  } catch (error) {
    res.status(500).json(error)
  } finally {
    // untuk menutup koneksi (disconnect) dari database
    await client.close();
  }
})

router.get('/api/hobby/:id', async (req, res) => {
  try {
    // untuk connect ke database
    await client.connect();
    const hobby = await db.collection('hobbies').findOne({ _id: ObjectId(req.params.id) })
    if (hobby) {
      res.status(200).json({
        message: "Get Hobby Successfully",
        status: "success",
        data: hobby
      })
    } else {
      res.status(200).json({
        message: "Hobby Not Found",
        status: "success",
        data: hobby
      })
    }
  } catch (error) {
    res.status(500).json(error)
  } finally {
    // untuk menutup koneksi (disconnect) dari database
    await client.close();
  }
})

router.post('/api/hobby', async (req, res) => {
  try {
    await client.connect()
    const newDocument = {
      name: req.body.name,
      hobby: req.body.hobby
    }
    const result = await db.collection('hobbies').insertOne(newDocument)
    if (result.acknowledged === true) {
      res.status(201).json({
        message: "Hobby Created Successfully",
        status: "success",
        data: newDocument
      })
    } else {
      res.status(500).json({
        message: "Hobby Failed to Create",
        status: "fail"
      })
    }
  } catch (error) {
    res.status(500).json(error)
  } finally {
    await client.close();
  }
})

router.put('/api/hobby/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(400).json({
        message: "Hobby Failed to Update, Please Insert ID",
        status: "fail"
      })
    } else {
      await client.connect()
      const { name, hobby } = req.body
      const result = await db.collection('hobbies').updateOne(
        {
          // wajib dikasih object id supaya bisa nemuin data dengan ID yang sesuai di collection nya
          _id: ObjectId(req.params.id),
        },
        {
          // method set untuk mengupdate data
          $set: {
            name: name,
            hobby: hobby
          }
        }
      )
      if (result.modifiedCount > 0) {
        res.status(201).json({
          message: "Hobby Updated Successfully",
          status: "success"
        })
      } else {
        res.status(500).json({
          message: "Hobby Failed to Update",
          status: "fail"
        })
      }
    }

  } catch (error) {
    res.status(500).json(error)
  } finally {
    await client.close();
  }
})

router.delete('/api/hobby', async (req, res) => {
  try {
    if (!req.query.id) {
      res.status(400).json({
        message: "Hobby Failed to Delete, Please Insert ID",
        status: "fail"
      })
    } else {
      await client.connect()
      const result = await db.collection('hobbies').deleteOne({
        _id: ObjectId(req.query.id)
      })
      if (result.deletedCount > 0) {
        res.status(201).json({
          message: "Hobby Deleted Successfully",
          status: "success"
        })
      } else {
        res.status(500).json({
          message: "Hobby Failed to Delete",
          status: "fail"
        })
      }
    }

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message })
  } finally {
    await client.close();
  }
})

module.exports = router