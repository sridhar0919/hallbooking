const { ObjectId } = require('bson');
var express = require('express');
var router = express.Router();
const { dbUrl, mongodb, MongoClient } = require('../dbConfig');

/* GET users listing. */
router.get('/', async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db('Hallbooking-api');
    let data = await db.collection('rooms').find().toArray();
    res.send({
      message: 'Fetched successfully',
      details: data,
    });
  } catch (e) {
    console.log(e);
    res.send({
      message: 'Error in connection',
    });
  } finally {
    client.close();
  }
});

// Create room
router.post('/register', async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db('Hallbooking-api');
    let room = await db.collection('rooms').insertMany(req.body);
    res.send({
      message: 'Room created',
    });
  } catch (error) {
    console.log(error);
    res.send({ message: 'Error,Room not created' });
  } finally {
    client.close();
  }
});

// book room
router.put('/book-room/:id', async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db('Hallbooking-api');
    let room = await db
      .collection('rooms')
      .findOne({ _id: ObjectId(req.params.id) });
    if (room.booked_status === 'no') {
      let data = await db.collection('rooms').updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $push: { customer_details: req.body },
          $set: { booked_status: 'yes' },
        }
      );
      res.send({
        message: 'Room booked',
      });
    } else {
      res.send({
        message: 'Room is already booked',
      });
    }
  } catch (error) {
    console.log(error);
    res.send({ message: 'Error in connection' });
  } finally {
    client.close();
  }
});

// Get all customers
router.get('/customers', async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    const db = await client.db('Hallbooking-api');
    let rooms = await db
      .collection('rooms')
      .find({ booked_status: 'yes' })
      .toArray();
    let customers = [];
    rooms.map((e) => {
      customers.push(e.customer_details);
      customers.push(e._id);
    });
    res.send({
      message: 'Fetched customers',
      details: customers,
    });
  } catch (error) {
    console.log(error);
    res.send({ message: 'Error,Room not created' });
  } finally {
    client.close();
  }
});

module.exports = router;
