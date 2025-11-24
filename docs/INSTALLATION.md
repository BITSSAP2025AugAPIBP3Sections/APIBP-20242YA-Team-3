# Installation Guide

Complete installation instructions for all deployment methods.


## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Deployment Methods](#deployment-methods)
  - [Docker Compose](#docker-compose-recommended)
  - [Kubernetes](#kubernetes-deployment)
  - [Local Development](#local-development)
  - [AWS EC2](#aws-ec2-deployment)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)


## Prerequisites

### All Methods
- **Git** - [Download](https://git-scm.com/)
- **Node.js 14+** - [Download](https://nodejs.org/)

### Docker Compose
- **Docker Desktop** (Windows/Mac) - [Download](https://www.docker.com/products/docker-desktop)
- **Docker Engine + Docker Compose** (Linux) - [Install Guide](https://docs.docker.com/engine/install/)

### Kubernetes
- **Docker** (see above)
- **Minikube** - [Download](https://minikube.sigs.k8s.io/docs/start/)
- **kubectl** - [Download](https://kubernetes.io/docs/tasks/tools/)

### AWS Deployment
- **AWS CLI** - [Install Guide](https://aws.amazon.com/cli/)
- **AWS Account** with appropriate permissions


## Quick Start

```bash
# Clone the repository
git clone https://github.com/BITSSAP2025AugAPIBP3Sections/APIBP-20242YA-Team-3.git
cd APIBP-20242YA-Team-3

# Install dependencies
npm install

# Start with Docker Compose (recommended)
docker-compose up -d
```

**Access the application:**
- Frontend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs
- GraphQL: http://localhost:3000/graphql


## Deployment Methods

### Docker Compose (Recommended)

**Best for:** Development, testing, quick demos

#### Step 1: Clone Repository

```bash
git clone https://github.com/BITSSAP2025AugAPIBP3Sections/APIBP-20242YA-Team-3.git
cd APIBP-20242YA-Team-3
```

#### Step 2: Start Services

```bash
docker-compose up -d
```

This will:
- Build the application Docker image
- Start the Express API server
- Connect to MongoDB Atlas
- Initialize notification system

#### Step 3: Verify Installation

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test API
curl http://localhost:3000/api/v1/services
```

#### Stop Services

```bash
docker-compose down
```

#### Rebuild After Code Changes

```bash
docker-compose up -d --build
```


### Kubernetes Deployment

**Best for:** Production-like environments, learning Kubernetes

#### Step 1: Start Minikube

```bash
minikube start --memory=4096 --cpus=2
```

#### Step 2: Build Docker Image

```bash
# Use Minikube's Docker daemon
eval $(minikube docker-env)

# Build image
docker build -t service-api:latest .
```

#### Step 3: Apply Kubernetes Manifests

```bash
# Apply configuration
kubectl apply -f deployment/kubernetes/k8s-configmap.yaml

# Deploy application
kubectl apply -f deployment/kubernetes/k8s-deployment.yaml

# Optional: Deploy Kafka (for event streaming)
kubectl apply -f deployment/kubernetes/k8s-kafka.yaml
```

#### Step 4: Verify Deployment

```bash
# Check pods
kubectl get pods

# Check services
kubectl get services

# View logs
kubectl logs -l app=service-api

# Get service URL
minikube service service-api --url
```

#### Access Application

```bash
# Get the URL
export SERVICE_URL=$(minikube service service-api --url)

# Test API
curl $SERVICE_URL/api/v1/services
```

#### Scale Deployment

```bash
# Scale to 3 replicas
kubectl scale deployment service-api --replicas=3

# Check status
kubectl get pods
```

#### Cleanup

```bash
# Delete resources
kubectl delete -f deployment/kubernetes/k8s-deployment.yaml
kubectl delete -f deployment/kubernetes/k8s-configmap.yaml

# Stop Minikube
minikube stop
```


### Local Development

**Best for:** Active development, debugging, code changes

#### Step 1: Clone and Install

```bash
git clone https://github.com/BITSSAP2025AugAPIBP3Sections/APIBP-20242YA-Team-3.git
cd APIBP-20242YA-Team-3

# Install dependencies
npm install
```

If you encounter dependency conflicts:
```bash
npm install --legacy-peer-deps
```

#### Step 2: Configure Environment

Create a `.env` file (optional):
```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/service-db
NODE_ENV=development
```

#### Step 3: Start the Server

```bash
npm start
```

Or use nodemon for auto-restart:
```bash
npm install -g nodemon
nodemon index.js
```

#### Step 4: Verify Installation

Open your browser:
- http://localhost:3000 - Main application
- http://localhost:3000/api-docs - Swagger UI
- http://localhost:3000/graphql - GraphQL Playground


### AWS EC2 Deployment

**Best for:** Production deployment

#### Step 1: Launch EC2 Instance

```bash
# Create EC2 instance using AWS CLI
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t2.medium \
  --key-name your-key-pair \
  --security-groups service-api-sg \
  --user-data file://deployment/aws/ec2-user-data.sh
```

Or use the CloudFormation template:
```bash
aws cloudformation create-stack \
  --stack-name service-api-stack \
  --template-body file://deployment/aws/ec2-autoscaling.yaml \
  --parameters ParameterKey=KeyName,ParameterValue=your-key-pair
```

#### Step 2: Connect to Instance

```bash
ssh -i your-key-pair.pem ec2-user@<instance-public-ip>
```

#### Step 3: Install Dependencies

```bash
# Update system
sudo yum update -y

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Install Docker (optional)
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
```

#### Step 4: Clone and Setup

```bash
# Clone repository
git clone https://github.com/BITSSAP2025AugAPIBP3Sections/APIBP-20242YA-Team-3.git
cd APIBP-20242YA-Team-3

# Install dependencies
npm install

# Start with PM2 (process manager)
sudo npm install -g pm2
pm2 start index.js --name service-api
pm2 save
pm2 startup
```

#### Step 5: Configure Security Group

Ensure inbound rules allow:
- Port 3000 (HTTP API)
- Port 22 (SSH)
- Port 443 (HTTPS - if using SSL)

#### Step 6: Setup Domain (Optional)

```bash
# Install Nginx
sudo yum install -y nginx

# Configure reverse proxy
sudo nano /etc/nginx/conf.d/service-api.conf
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Start Nginx:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```


## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | MongoDB Atlas |
| `NODE_ENV` | Environment mode | `development` |
| `LOG_LEVEL` | Logging level | `info` |

### MongoDB Configuration

The application uses MongoDB Atlas by default. Update connection in `src/config/database.js`:

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'your-connection-string', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```


## Verification

### Health Check Endpoints

```bash
# Check server status
curl http://localhost:3000/

# Check API
curl http://localhost:3000/api/v1/services

# Check GraphQL
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ services { id name } }"}'
```

### Log Files

Logs are stored in the `logs/` directory:
- `access.log` - HTTP access logs
- `error.log` - Error logs
- `debug.log` - Debug information

View logs:
```bash
tail -f logs/access.log
tail -f logs/error.log
```


## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Docker Issues

```bash
# Remove all containers and rebuild
docker-compose down -v
docker-compose up -d --build

# View container logs
docker-compose logs -f service-api

# Check container status
docker ps -a
```

### MongoDB Connection Issues

1. Check MongoDB Atlas IP whitelist
2. Verify connection string format
3. Ensure network access is enabled
4. Check credentials

```bash
# Test connection
mongosh "your-connection-string"
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use legacy peer deps
npm install --legacy-peer-deps
```

### Kubernetes Issues

```bash
# Check pod status
kubectl describe pod <pod-name>

# View logs
kubectl logs <pod-name>

# Restart deployment
kubectl rollout restart deployment service-api

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

### Permission Denied

```bash
# Linux/Mac - fix permissions
sudo chown -R $USER:$USER .

# Give execute permission
chmod +x scripts/*.sh
```


## Next Steps

After successful installation:

1. **[Read the API Documentation](API.md)** - Learn about available endpoints
2. **[Explore the Architecture](ARCHITECTURE.md)** - Understand system design
3. **[Follow User Journey](USER_JOURNEY.md)** - See complete workflows
4. **[Start Contributing](CONTRIBUTING.md)** - Make your first contribution


## Support

Having issues? Here's how to get help:

1. **Check [Troubleshooting](#troubleshooting)** section above
2. **Search [GitHub Issues](https://github.com/BITSSAP2025AugAPIBP3Sections/APIBP-20242YA-Team-3/issues)**
3. **Create a new issue** with:
   - Your OS and Node.js version
   - Deployment method used
   - Error messages and logs
   - Steps to reproduce


**[← Back to README](../README.md)** | **[View API Reference →](API.md)**
