import https from 'https';
import Flower from "../schema/models/Flower.js";
import { config } from "../config/config.js";
const { floraKey } = config;

const { facebookPageAccessToken } = config;

export const flowerController = {
  create: async (req, res) => {
    try {
      const newFlower = new Flower(req.body);
      await newFlower.save();
      const { name, description, imageUrl } = req.body; 
      await postToFacebook(name, description, imageUrl);
      res.status(201).json(newFlower);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

 getAll: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const viewAll = req.query.viewAll === 'true';

      let query = {};
      let sort = {};

      if (req.query.search) {
        query.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      if (req.query.category) {
        query.category = req.query.category;
      }

      if (req.query.color) {
        query.color = req.query.color;
      }

      if (req.query.sort) {
        const [field, order] = req.query.sort.split('-');
        sort[field] = order === 'asc' ? 1 : -1;
      }

      let flowerQuery = Flower.find(query).sort(sort);

      if (!viewAll) {
        const skip = (page - 1) * limit;
        flowerQuery = flowerQuery.skip(skip).limit(limit);
      }

      const flowers = await flowerQuery;
      const total = await Flower.countDocuments(query);

      res.json({
        flowers,
        currentPage: viewAll ? 1 : page,
        totalPages: viewAll ? 1 : Math.ceil(total / limit),
        totalItems: total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getFilterOptions: async (req, res) => {
    try {
      const categories = await Flower.distinct('category');
      const colors = await Flower.distinct('color');
  
      res.json({
        categories,
        colors
      });
    } catch (error) {
      res.status(500).json({ message: error.message, stack: error.stack });
    }
  },
  getById: async (req, res) => {
    try {
      const flower = await Flower.findById(req.params.id);
      if (!flower) return res.status(404).json({ message: "Flower not found" });
      res.json(flower);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const updatedFlower = await Flower.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedFlower) return res.status(404).json({ message: "Flower not found" });
      res.json(updatedFlower);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const deletedFlower = await Flower.findByIdAndDelete(req.params.id);
      if (!deletedFlower) return res.status(404).json({ message: "Flower not found" });
      res.json({ message: "Flower deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const updatedFlower = await Flower.findByIdAndUpdate(
        id,
        { stock },
        { new: true }
      );
      if (!updatedFlower) return res.status(404).json({ message: "Flower not found" });
      res.json(updatedFlower);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  //Featured Flowers
  getTopSellingFlowers: async (req, res) => {
    try {
      const topFlowers = await Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.flower", totalSold: { $sum: "$items.quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        { $lookup: { from: "flowers", localField: "_id", foreignField: "_id", as: "flowerDetails" } },
        { $unwind: "$flowerDetails" },
        { $project: { _id: 1, totalSold: 1, name: "$flowerDetails.name", price: "$flowerDetails.price" } }
      ]);
      res.json(topFlowers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getNewArrivals: async (req, res) => {
    try {
      const newFlowers = await Flower.find()
        .sort({ createdAt: -1 })
        .limit(10);
      res.json(newFlowers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getInfo: async (req, res) => {
    const flowerName = req.query.name;
    const options = {
      'method': 'GET',
      'hostname': 'api.floracodex.com',
      'path': `/v1/species/search/?token=${floraKey}&q=${flowerName}`,
      'headers': {
      },
      'maxRedirects': 20
    };

    const apiReq = https.request(options, function (apiRes) {
      const chunks = [];

      apiRes.on('data', function (chunk) {
        chunks.push(chunk);
      });

      apiRes.on('end', function () {
        const body = Buffer.concat(chunks);
        try {
          const outputData = JSON.parse(body.toString());
          const jsonData = outputData.data;
          if (jsonData && jsonData.length > 0) {
            const plantDetails = jsonData[0];
            if (plantDetails) {
              res.json({
                commonName: plantDetails.common_name || 'Not available',
                scientificName: plantDetails.scientific_name || 'Not available',
                family: plantDetails.family || 'Not available',
                genus: plantDetails.genus || 'Not available',
                genus_id: plantDetails.genus_id
              });
            } else {
              res.json({ message: 'No plants found' });
            }
          } else {
            res.json({ message: 'No plants found' });
          }
        } catch (error) {
          console.error('Error parsing API response:', error);
          res.status(500).json({ error: 'Failed to parse plant information' });
        }
      });
    });

    apiReq.on('error', function (error) {
      console.error('Error fetching from Garden API:', error);
      res.status(500).json({ error: 'Failed to fetch plant information' });
    });

    apiReq.end();
  },

};

async function postToFacebook(flowerName, flowerDescription, flowerImageUrl) {

  const postUrl = `https://graph.facebook.com/v12.0/428875076980152/feed?access_token=${facebookPageAccessToken}`;

  const response = await fetch(postUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          message: `${flowerName}: ${flowerDescription}`,
          link: flowerImageUrl
      }),
  });

  if (response.ok) {
      console.log('Flower posted successfully to Facebook!');
  } else {
      console.error('Error posting to Facebook:', await response.text());
  }
}