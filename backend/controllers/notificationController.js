const webpush = require("web-push");
const Subscription = require("../models/Subscription");
const Bike = require("../models/Bike");
const Cluster = require("../models/Cluster");

// Configure VAPID standard identification keys
webpush.setVapidDetails(
  "mailto:pipip6296@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

// Save admin mobile browser subscription token configuration keys
exports.subscribeDevice = async (req, res) => {
  try {
    const { endpoint, keys, areaId, userId } = req.body;

    if (!endpoint || !keys) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid subscription payload." });
    }

    const updateData = { endpoint, keys };
    if (areaId) updateData.areaId = areaId;
    if (userId) updateData.userId = userId;

    // Check if subscription already exists, if not create a new record
    await Subscription.findOneAndUpdate(
      { endpoint },
      updateData,
      { upsert: true, new: true },
    );

    res
      .status(201)
      .json({ success: true, message: "Smart device synced successfully." });
  } catch (error) {
    console.error("Subscription Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to link notification stream." });
  }
};

/**
 * Global Real-time Dispatch Hook Engine
 * Call this directly in your Checkout/Booking Controller right after an online transaction saves!
 * Example: sendOrderAlerts(savedBookingDoc, req.app.get("io"));
 */
exports.sendOrderAlerts = async (orderData, io) => {
  let areaId = null;
  let areaName = "";

  try {
    if (orderData.bike_id) {
      const bike = await Bike.findById(orderData.bike_id).populate("area_id").lean();
      if (bike && bike.area_id) {
        areaId = bike.area_id._id ? bike.area_id._id.toString() : bike.area_id.toString();
        areaName = bike.area_id.name || "";
      }
    } else if (orderData.cluster_id) {
      const cluster = await Cluster.findById(orderData.cluster_id).populate("area_id").lean();
      if (cluster && cluster.area_id) {
        areaId = cluster.area_id._id ? cluster.area_id._id.toString() : cluster.area_id.toString();
        areaName = cluster.area_id.name || "";
      }
    }
  } catch (err) {
    console.error("Error resolving area for order alerts:", err);
  }

  const alertText = `📦 ${orderData.customer_name || "Customer"} placed an online order!\n💰 Total: ₹${orderData.total_amount || 0}\n🛵 Model: ${orderData.vehicle_make_model || "Scooter"}${areaName ? `\n📍 Area: ${areaName}` : ""}`;

  // 1. Instant WebSocket push for dashboard screens currently active on monitor
  if (io) {
    io.emit("newOnlineOrderStream", {
      id: Date.now(),
      title: "🔔 New Online Order!",
      message: alertText.replace(/\n/g, " | "),
      type: "order",
      time: "Just Now",
      areaId: areaId,
      areaName: areaName,
      bookingData: orderData,
    });
  }

  // 2. Encrypted background push message layout architecture for locked phone screen states
  const pushPayload = JSON.stringify({
    title: "🔔 New Pipip Online Booking!",
    body: alertText,
    icon: "/logo.jpeg",
    badge: "/logo.jpeg",
    url: "/admin/panel/notifications",
  });

  try {
    let subQuery = {};
    if (areaId) {
      subQuery = {
        $or: [
          { areaId: null },
          { areaId: areaId },
        ],
      };
    }

    const subscriptions = await Subscription.find(subQuery);

    subscriptions.forEach((sub) => {
      webpush.sendNotification(sub, pushPayload).catch(async (err) => {
        console.error("Failed to send web-push notification to subscription endpoint:", sub.endpoint, err);
        // Automatically prune old or revoked device tokens if a manager resets browser settings
        if (err.statusCode === 410 || err.statusCode === 404) {
          await Subscription.deleteOne({ _id: sub._id });
        }
      });
    });
  } catch (err) {
    console.error("Web Push broadcasting delivery engine exception:", err);
  }
};