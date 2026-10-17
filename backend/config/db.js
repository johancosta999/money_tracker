const dns = require("dns");
const mongoose = require("mongoose");

const connectOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, connectOptions);
        console.log("MongoDB connected");
    } catch (error) {
        // mongodb+srv:// URIs need a DNS SRV lookup. Some home routers' DNS
        // servers answer it in a way Node rejects (querySrv EBADRESP / ECONNREFUSED),
        // even though Windows itself resolves it fine. Retry once with public DNS.
        if (error.message?.startsWith("querySrv")) {
            console.warn(`${error.message} - retrying with public DNS servers`);
            dns.setServers(["1.1.1.1", "8.8.8.8"]);

            try {
                await mongoose.connect(process.env.MONGO_URI, connectOptions);
                console.log("MongoDB connected");
                return;
            } catch (retryError) {
                error = retryError;
            }
        }

        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
