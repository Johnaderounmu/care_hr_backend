#!/bin/bash

# 🔍 Care HR Backend - Port Debugging & Server Diagnostics

echo "🔍 Care HR Backend Diagnostics"
echo "=============================="
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    echo "🔍 Checking port $port..."
    
    # Check if port is listening
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is in use by:"
        lsof -Pi :$port -sTCP:LISTEN
        echo ""
        
        # Offer to kill the process
        read -p "Kill processes on port $port? (y/n): " kill_choice
        if [[ $kill_choice =~ ^[Yy]$ ]]; then
            echo "🔥 Killing processes on port $port..."
            lsof -ti:$port | xargs kill -9 2>/dev/null
            sleep 2
            
            if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
                echo "❌ Failed to kill all processes. You may need sudo:"
                echo "sudo lsof -ti:$port | xargs sudo kill -9"
            else
                echo "✅ Port $port is now free!"
            fi
        fi
    else
        echo "✅ Port $port is available"
    fi
    echo ""
}

# Function to test server startup
test_server_startup() {
    local port=$1
    echo "🚀 Testing server startup on port $port..."
    
    # Try to start server in background
    npm run dev &
    SERVER_PID=$!
    
    echo "⏳ Waiting for server to start..."
    sleep 5
    
    # Test health endpoint
    if curl -s http://localhost:$port/health >/dev/null 2>&1; then
        echo "✅ Server started successfully!"
        curl -s http://localhost:$port/health | jq . 2>/dev/null || curl -s http://localhost:$port/health
    else
        echo "❌ Server failed to start or respond"
        echo "📋 Server logs:"
        ps aux | grep node | grep -v grep
    fi
    
    # Kill test server
    kill $SERVER_PID 2>/dev/null
    sleep 2
    echo ""
}

# Function to check system requirements
check_requirements() {
    echo "🔧 Checking system requirements..."
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        echo "✅ Node.js: $(node --version)"
    else
        echo "❌ Node.js not found"
    fi
    
    # Check npm
    if command -v npm >/dev/null 2>&1; then
        echo "✅ npm: $(npm --version)"
    else
        echo "❌ npm not found"
    fi
    
    # Check PostgreSQL
    if command -v psql >/dev/null 2>&1; then
        echo "✅ PostgreSQL client available"
    else
        echo "⚠️  PostgreSQL client not found (optional for development)"
    fi
    
    # Check if in correct directory
    if [ -f "package.json" ]; then
        echo "✅ In correct project directory"
    else
        echo "❌ Not in care_hr_backend directory"
    fi
    
    echo ""
}

# Function to check network connectivity
check_network() {
    echo "🌐 Checking network connectivity..."
    
    # Test localhost connectivity
    if nc -z localhost 80 2>/dev/null; then
        echo "✅ Localhost networking working"
    else
        echo "⚠️  Localhost networking issue detected"
    fi
    
    # Test external connectivity
    if ping -c 1 google.com >/dev/null 2>&1; then
        echo "✅ External network connectivity"
    else
        echo "⚠️  External network connectivity issue"
    fi
    
    echo ""
}

# Function to show environment info
show_environment() {
    echo "📊 Environment Information:"
    echo "OS: $(uname -s)"
    echo "Architecture: $(uname -m)"
    echo "Shell: $SHELL"
    
    if [ -f ".env" ]; then
        echo "✅ .env file found"
    else
        echo "⚠️  .env file not found (this is OK for development)"
    fi
    
    echo ""
}

# Function to create alternative server
create_simple_server() {
    echo "🔧 Creating simple test server..."
    
    cat > simple-test-server.js << 'EOF'
const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    console.log('✅ Health check requested');
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Simple test server working!'
    });
});

app.get('/test', (req, res) => {
    res.json({ message: 'Test endpoint working!' });
});

const ports = [4000, 4001, 4002, 4003, 4004];

function tryPort(index) {
    if (index >= ports.length) {
        console.error('❌ All ports failed');
        process.exit(1);
    }
    
    const port = ports[index];
    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`✅ Simple test server running on http://localhost:${port}`);
        console.log(`🔍 Test: curl http://localhost:${port}/health`);
    });
    
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️  Port ${port} in use, trying next...`);
            tryPort(index + 1);
        } else {
            console.error(`❌ Server error: ${err.message}`);
        }
    });
}

tryPort(0);
EOF

    echo "✅ Created simple-test-server.js"
    echo "🚀 Start with: node simple-test-server.js"
    echo ""
}

# Main menu
echo "Choose diagnostic option:"
echo "1. 🔍 Check common ports (4000-4005)"
echo "2. 🚀 Test server startup"
echo "3. 🔧 Check system requirements"
echo "4. 🌐 Check network connectivity"
echo "5. 📊 Show environment info"
echo "6. 🔧 Create simple test server"
echo "7. 🩺 Run full diagnostic"
echo ""

read -p "Choose option (1-7): " choice

case $choice in
    1)
        for port in 4000 4001 4002 4003 4004 4005; do
            check_port $port
        done
        ;;
    2)
        check_port 4000
        test_server_startup 4000
        ;;
    3)
        check_requirements
        ;;
    4)
        check_network
        ;;
    5)
        show_environment
        ;;
    6)
        create_simple_server
        ;;
    7)
        echo "🩺 Running full diagnostic..."
        echo ""
        check_requirements
        show_environment
        check_network
        for port in 4000 4001 4002; do
            check_port $port
        done
        test_server_startup 4000
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo "🔍 Diagnostic complete!"
echo ""
echo "💡 Troubleshooting tips:"
echo "- If ports are blocked: Use alternative ports or kill blocking processes"
echo "- If server won't start: Check npm install and build process"
echo "- If network issues: Check firewall and proxy settings"
echo "- For development: Use the simple test server to isolate issues"