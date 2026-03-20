#!/bin/bash
set -e

echo "🔹 Starting full MongoDB SSL setup..."

# 1️⃣ Work in a temporary directory
TMPDIR=$(mktemp -d)
cd "$TMPDIR"

# 2️⃣ Generate a new CA private key
echo "🔹 Generating CA key..."
openssl genrsa -out mongodb-ca.key 4096

# 3️⃣ Generate a new CA certificate
echo "🔹 Generating CA certificate..."
openssl req -x509 -new -nodes -key mongodb-ca.key -sha256 -days 3650 \
  -out mongodb-ca.crt \
  -subj "/C=US/ST=YourState/L=YourCity/O=MongoCA/OU=IT/CN=docman-ca"

# 4️⃣ Generate a new MongoDB server private key
echo "🔹 Generating MongoDB server key..."
openssl genrsa -out server.key 4096

# 5️⃣ Generate server CSR
echo "🔹 Generating server CSR..."
openssl req -new -key server.key -out server.csr \
  -subj "/C=US/ST=YourState/L=YourCity/O=MongoServer/OU=IT/CN=docman-server"

# 6️⃣ Create a config for SANs
echo "🔹 Creating SAN config..."
cat > server-ext.cnf <<EOF
subjectAltName = DNS:localhost,DNS:docman-server,DNS:docman.resonancedesigns.dev,IP:127.0.0.1,IP:66.228.55.48,IP:75.236.83.121
EOF

# 7️⃣ Sign server CSR with SANs
echo "🔹 Signing server CSR..."
openssl x509 -req -in server.csr -CA mongodb-ca.crt -CAkey mongodb-ca.key -CAcreateserial \
  -out server.crt -days 365 -sha256 -extfile server-ext.cnf

# 8️⃣ Combine server cert + key into a single PEM
echo "🔹 Creating mongo.pem..."
cat server.crt server.key > mongo.pem

# 9️⃣ Generate a new client private key
echo "🔹 Generating client key..."
openssl genrsa -out client.key 4096

# 🔟 Generate a client CSR
echo "🔹 Generating client CSR..."
openssl req -new -key client.key -out client.csr \
  -subj "/C=US/ST=YourState/L=YourCity/O=MongoClient/OU=IT/CN=docman-client"

# 1️⃣1️⃣ Sign the client CSR with the CA
echo "🔹 Signing client CSR..."
openssl x509 -req -in client.csr -CA mongodb-ca.crt -CAkey mongodb-ca.key -CAcreateserial \
  -out client.crt -days 365 -sha256

# 1️⃣2️⃣ Combine client certificate + key into a single PEM
echo "🔹 Creating client.pem..."
cat client.crt client.key > client.pem

# 1️⃣3️⃣ Move certificates to /etc/mongodb-ssl with correct permissions
echo "🔹 Installing certificates..."
sudo mkdir -p /etc/mongodb-ssl/ca
sudo mv mongo.pem /etc/mongodb-ssl/
sudo mv client.pem /etc/mongodb-ssl/
sudo mv mongodb-ca.crt /etc/mongodb-ssl/ca/mongodb-ca.crt
sudo mv mongodb-ca.key /etc/mongodb-ssl/ca/mongodb-ca.key

sudo chown mongodb:mongodb /etc/mongodb-ssl/mongo.pem /etc/mongodb-ssl/client.pem
sudo chmod 600 /etc/mongodb-ssl/mongo.pem /etc/mongodb-ssl/client.pem

sudo chown mongodb:mongodb /etc/mongodb-ssl/ca/mongodb-ca.crt
sudo chmod 644 /etc/mongodb-ssl/ca/mongodb-ca.crt

sudo chown mongodb:mongodb /etc/mongodb-ssl/ca/mongodb-ca.key
sudo chmod 600 /etc/mongodb-ssl/ca/mongodb-ca.key

# 1️⃣4️⃣ Restart MongoDB and DocMan backend
echo "🔹 Restarting MongoDB..."
sudo systemctl restart mongod

echo "🔹 Restarting DocMan backend..."
sudo systemctl restart docman-backend

echo "✅ MongoDB SSL setup complete. Check backend logs with:"
echo "   sudo journalctl -u docman-backend -f"
