const express = require("express")
const app = express()
const router = express.Router()
const client = require('./connection')
const db = client.db('user_list')
const ObjectId = require("mongodb").ObjectId

router.get('/api/user', async (req, res) => {
  try {
    // untuk connect ke database
    await client.connect();
    const users = await db.collection('users').find().toArray()
    if (users.length > 0) {
      res.status(200).json({
        message: "Get List Users Successfully",
        status: "success",
        data: users
      })
    } else {
      res.status(200).json({
        message: "No User List Found",
        status: "success",
        data: users
      })
    }
  } catch (error) {
    res.status(500).json(error)
  } finally {
    // untuk menutup koneksi (disconnect) dari database
    await client.close();
  }
})

router.get('/api/user/:id', async (req, res) => {
  try {
    // untuk connect ke database
    await client.connect();
    const users = await db.collection('users').findOne({ _id: ObjectId(req.params.id) })
    if (users) {
      res.status(200).json({
        message: "Get User Successfully",
        status: "success",
        data: users
      })
    } else {
      res.status(200).json({
        message: "User Not Found",
        status: "success",
        data: users
      })
    }
  } catch (error) {
    res.status(500).json(error)
  } finally {
    // untuk menutup koneksi (disconnect) dari database
    await client.close();
  }
})

router.post('/api/user', async (req, res) => {
  try {
    await client.connect()
    const newDocument = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    }
    const result = await db.collection('users').insertOne(newDocument)
    if (result.acknowledged === true) {
      res.status(201).json({
        message: "User Created Successfully",
        status: "success",
        data: newDocument
      })
    } else {
      res.status(500).json({
        message: "User Failed to Create",
        status: "fail"
      })
    }
  } catch (error) {
    res.status(500).json(error)
  } finally {
    await client.close();
  }
})

router.put('/api/user/:id', async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(400).json({
        message: "User Failed to Update, Please Insert ID",
        status: "fail"
      })
    } else {
      await client.connect()
      const { name, email, password } = req.body
      const result = await db.collection('users').updateOne(
        {
          // wajib dikasih object id supaya bisa nemuin data dengan ID yang sesuai di collection nya
          _id: ObjectId(req.params.id),
        },
        {
          // method set untuk mengupdate data
          $set: {
            name: name,
            email: email,
            password : password
          }
        }
      )
      if (result.modifiedCount > 0) {
        res.status(201).json({
          message: "User Updated Successfully",
          status: "success"
        })
      } else {
        res.status(500).json({
          message: "User Failed to Update",
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

router.delete('/api/user', async (req, res) => {
  try {
    if (!req.query.id) {
      res.status(400).json({
        message: "User Failed to Delete, Please Insert ID",
        status: "fail"
      })
    } else {
      await client.connect()
      const result = await db.collection('users').deleteOne({
        _id: ObjectId(req.query.id)
      })
      if (result.deletedCount > 0) {
        res.status(201).json({
          message: "User Deleted Successfully",
          status: "success"
        })
      } else {
        res.status(500).json({
          message: "User Failed to Delete",
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