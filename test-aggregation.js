db = db.getSiblingDB('briconomy');

const result = db.leases.aggregate([
  { $match: { _id: ObjectId('68f8070b5469bcbb6b7d044e') } },
  {
    $lookup: {
      from: "users",
      localField: "tenantId",
      foreignField: "_id",
      as: "tenantData"
    }
  },
  {
    $lookup: {
      from: "properties",
      localField: "propertyId",
      foreignField: "_id",
      as: "propertyData"
    }
  },
  {
    $lookup: {
      from: "units",
      localField: "unitId",
      foreignField: "_id",
      as: "unitData"
    }
  },
  {
    $addFields: {
      tenant: {
        $cond: {
          if: { $gt: [{ $size: "$tenantData" }, 0] },
          then: {
            _id: { $arrayElemAt: ["$tenantData._id", 0] },
            fullName: { $arrayElemAt: ["$tenantData.fullName", 0] },
            email: { $arrayElemAt: ["$tenantData.email", 0] },
            phone: { $arrayElemAt: ["$tenantData.phone", 0] }
          },
          else: null
        }
      },
      property: {
        $cond: {
          if: { $gt: [{ $size: "$propertyData" }, 0] },
          then: {
            _id: { $arrayElemAt: ["$propertyData._id", 0] },
            name: { $arrayElemAt: ["$propertyData.name", 0] },
            address: { $arrayElemAt: ["$propertyData.address", 0] }
          },
          else: null
        }
      },
      unit: {
        $cond: {
          if: { $gt: [{ $size: "$unitData" }, 0] },
          then: {
            _id: { $arrayElemAt: ["$unitData._id", 0] },
            unitNumber: { $arrayElemAt: ["$unitData.unitNumber", 0] }
          },
          else: null
        }
      }
    }
  }
]).toArray();

printjson(result);
