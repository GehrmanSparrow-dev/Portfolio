/* ==========================================================================
   Surya Teja Anupindi Portfolio Interactivity Engine - app.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initCursorGlow();
    initNeuralCanvas();
    init3DTilt();
    initPlaygroundTabs();
    initArgRAGPlayground();
    initEHRPlayground();
    initGradCAMPlayground();
    initRouteOptimizer();
    initTerminal();
    initMobileMenu();
    initContactForm();
});

/* ==========================================================================
   1. Cursor Glow & Particle Canvas
   ========================================================================== */
let mouse = { x: null, y: null };

function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        glow.style.left = mouse.x + 'px';
        glow.style.top = mouse.y + 'px';
    });
}

function initNeuralCanvas() {
    const canvas = document.getElementById('neural-canvas');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    const maxParticles = 90;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.radius = Math.random() * 2 + 1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
            ctx.fill();
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Boundary bounce
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
            
            // Mouse magnet pull
            if (mouse.x && mouse.y) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 120) {
                    this.x += dx * 0.015;
                    this.y += dy * 0.015;
                }
            }
        }
    }
    
    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < maxParticles; i++) {
            particlesArray.push(new Particle());
        }
    }
    initParticles();
    
    function connectParticles() {
        for (let i = 0; i < particlesArray.length; i++) {
            for (let j = i + 1; j < particlesArray.length; j++) {
                let dx = particlesArray[i].x - particlesArray[j].x;
                let dy = particlesArray[i].y - particlesArray[j].y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 110) {
                    let alpha = (110 - dist) / 110 * 0.15;
                    ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        connectParticles();
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

/* ==========================================================================
   2. 3D Card Hover Tilt Effect
   ========================================================================== */
function init3DTilt() {
    const cards = document.querySelectorAll('[data-tilt]');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position inside elements
            const y = e.clientY - rect.top;  // y position inside elements
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // calculate angle of rotation: max 8 degrees
            const rotateX = -(y - centerY) / centerY * 8;
            const rotateY = (x - centerX) / centerX * 8;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        });
    });
}

/* ==========================================================================
   3. Navigation Tabs
   ========================================================================== */
function initPlaygroundTabs() {
    const tabs = document.querySelectorAll('.pg-tab');
    const contents = document.querySelectorAll('.playground-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const pgName = tab.getAttribute('data-pg');
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`pg-${pgName}`).classList.add('active');
            
            // If Route tab, resize and redraw canvas
            if (pgName === 'route') {
                const opt = window.routeOptimizerInstance;
                if (opt) opt.resize();
            }
        });
    });
}

/* ==========================================================================
   4. ArgRAG Playground Flow
   ========================================================================== */
function initArgRAGPlayground() {
    const runBtn = document.getElementById('run-rag-btn');
    const select = document.getElementById('rag-query');
    const consoleOutput = document.getElementById('rag-console-output');
    
    const steps = {
        retrieve: document.getElementById('step-retrieve'),
        rrf: document.getElementById('step-rrf'),
        classify: document.getElementById('step-classify'),
        generate: document.getElementById('step-generate')
    };

    const queriesData = {
        q1: {
            retrieval: "Retrieving documents related to 'acetaminophen safe acute liver injury'...\nBM25: Found 12 matching passages. Max Score: 18.52\nDPR: Found 15 dense matches. Max Cosine Similarity: 0.892",
            rrf: "Running Reciprocal Rank Fusion (RRF)...\nRankings merged. Consensus document ID: DOC_9022 (RRF Score: 0.0827)\nPassage Content: 'In acute liver injury, paracetamol (acetaminophen) must be strictly avoided or limited due to impaired hepatic clearance paths.'",
            classification: "Executing RoBERTa/DeBERTa Argument Voting Ensemble...\nBERT Model A: ATTACK (Conf: 96%)\nRoBERTa Model B: ATTACK (Conf: 94%)\nDeBERTa Model C: ATTACK (Conf: 98%)\nFinal Verdict: ATTACK (Consensus Label: Passage refutes query premise)",
            generation: "FLAN-T5 Generator prompt augmented with classified argument constraints:\nGenerated Response: No, acetaminophen is not considered safe for patients with acute liver injury. Empirical evidence indicates paracetamol clearance pathways are highly compromised, posing elevated risks of hepatotoxicity.",
            type: "attack"
        },
        q2: {
            retrieval: "Retrieving documents related to 'immunotherapy progress metastatic melanoma'...\nBM25: Found 20 sparse matches. Max Score: 24.11\nDPR: Found 18 dense matches. Max Cosine Similarity: 0.941",
            rrf: "Running Reciprocal Rank Fusion (RRF)...\nRankings merged. Consensus document ID: DOC_4192 (RRF Score: 0.0911)\nPassage Content: 'Combined PD-1 and CTLA-4 blockades demonstrate durable objective response rates and overall survival benefits in metastatic melanoma.'",
            classification: "Executing RoBERTa/DeBERTa Argument Voting Ensemble...\nBERT Model A: SUPPORT (Conf: 95%)\nRoBERTa Model B: SUPPORT (Conf: 92%)\nDeBERTa Model C: SUPPORT (Conf: 97%)\nFinal Verdict: SUPPORT (Consensus Label: Passage confirms query premise)",
            generation: "FLAN-T5 Generator prompt augmented with classified argument constraints:\nGenerated Response: Yes, immunotherapy shows significant progress. Dual blockades of checkpoint inhibitors (PD-1 and CTLA-4) show robust increases in long-term objective survival outcomes for metastatic melanoma patients.",
            type: "support"
        },
        q3: {
            retrieval: "Retrieving documents related to 'warning signs pediatric diabetic ketoacidosis'...\nBM25: Found 8 sparse matches. Max Score: 14.22\nDPR: Found 10 dense matches. Max Cosine Similarity: 0.811",
            rrf: "Running Reciprocal Rank Fusion (RRF)...\nRankings merged. Consensus document ID: DOC_1048 (RRF Score: 0.0754)\nPassage Content: 'Pediatric diabetic ketoacidosis presents with polyuria, polydipsia, lethargy, Kussmaul breathing, and breath smelling of ketones.'",
            classification: "Executing RoBERTa/DeBERTa Argument Voting Ensemble...\nBERT Model A: SUPPORT (Conf: 98%)\nRoBERTa Model C: SUPPORT (Conf: 99%)\nFinal Verdict: SUPPORT (Consensus Label: Passage confirms query premise)",
            generation: "FLAN-T5 Generator prompt augmented with classified argument constraints:\nGenerated Response: Warning signs of pediatric diabetic ketoacidosis (DKA) include severe fatigue, rapid deep respiration (Kussmaul breathing), sweet-smelling breath, frequent urination, and vomiting.",
            type: "support"
        }
    };

    let isRunning = false;

    runBtn.addEventListener('click', () => {
        if (isRunning) return;
        isRunning = true;
        
        // Reset steps classes
        Object.values(steps).forEach(s => {
            s.className = 'pipe-step';
        });
        
        const qKey = select.value;
        const data = queriesData[qKey];
        
        consoleOutput.innerHTML = `> Initializing pipeline flow for Query Code: [${qKey}]...`;
        
        // Step 1: Retrieve
        setTimeout(() => {
            steps.retrieve.classList.add('active');
            consoleOutput.innerHTML += `\n\n[INFO] Step 1: Retrieving context documents...\n${data.retrieval}`;
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }, 800);
        
        // Step 2: RRF
        setTimeout(() => {
            steps.rrf.classList.add('active');
            consoleOutput.innerHTML += `\n\n[INFO] Step 2: Merging channels...\n${data.rrf}`;
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }, 2200);
        
        // Step 3: Classify
        setTimeout(() => {
            const classVal = `success-${data.type}`;
            steps.classify.classList.add('active', classVal);
            consoleOutput.innerHTML += `\n\n[INFO] Step 3: Argument stance checking...\n${data.classification}`;
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }, 3600);
        
        // Step 4: Generate
        setTimeout(() => {
            steps.generate.classList.add('active');
            consoleOutput.innerHTML += `\n\n[SUCCESS] Step 4: LLM Generation complete!\n${data.generation}`;
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
            isRunning = false;
        }, 5000);
    });
}

/* ==========================================================================
   5. EHR Multimodal Risk Simulator
   ========================================================================== */
function initEHRPlayground() {
    const ageSlider = document.getElementById('ehr-age');
    const sbpSlider = document.getElementById('ehr-sbp');
    const creatinineSlider = document.getElementById('ehr-creatinine');
    const notesInput = document.getElementById('ehr-notes');
    
    const valAge = document.getElementById('val-age');
    const valSbp = document.getElementById('val-sbp');
    const valCreatinine = document.getElementById('val-creatinine');
    
    const riskText = document.getElementById('risk-score-text');
    const gaugeFill = document.getElementById('risk-gauge-fill');
    const riskAlert = document.getElementById('ehr-risk-alert');
    const textTokens = document.getElementById('ehr-text-tokens');
    
    const radius = 40;
    const circumference = 2 * Math.PI * radius; // ~251.2
    
    function updateRisk() {
        const age = parseInt(ageSlider.value);
        const sbp = parseInt(sbpSlider.value);
        const creatinine = parseFloat(creatinineSlider.value);
        const notes = notesInput.value.toLowerCase();
        
        valAge.textContent = age;
        valSbp.textContent = sbp;
        valCreatinine.textContent = creatinine.toFixed(1);
        
        // Compute mockup risk score
        let risk = 8; // base
        
        // Age factor
        risk += Math.max(0, (age - 45) * 0.35);
        
        // Blood pressure factor (deviation from 120 is bad, high BP especially)
        if (sbp > 130) {
            risk += (sbp - 130) * 0.25;
        } else if (sbp < 95) {
            risk += (95 - sbp) * 0.2;
        }
        
        // Creatinine factor
        if (creatinine > 1.2) {
            risk += (creatinine - 1.2) * 15;
        }
        
        // NLP Notes clinical analysis
        let wordBoost = 0;
        let matchedWords = [];
        const clinicalTriggers = {
            'renal': 15, 'kidney': 15, 'creatinine': 10,
            'chest': 20, 'cardiac': 20, 'pain': 5,
            'dyspnea': 18, 'breath': 12, 'lungs': 10,
            'sepsis': 22, 'shock': 25, 'unconscious': 25,
            'icu': 15, 'ventilator': 20
        };
        
        Object.keys(clinicalTriggers).forEach(word => {
            if (notes.includes(word)) {
                wordBoost += clinicalTriggers[word];
                matchedWords.push(word);
            }
        });
        
        risk += wordBoost;
        risk = Math.min(99, Math.max(5, Math.round(risk)));
        
        // Update Gauge
        riskText.textContent = `${risk}%`;
        const offset = circumference - (risk / 100) * circumference;
        gaugeFill.style.strokeDashoffset = offset;
        
        // Update statuses & colors
        const indicator = riskAlert.querySelector('.alert-indicator');
        const statusSpan = riskAlert.querySelector('.alert-status');
        
        indicator.className = 'alert-indicator';
        if (risk < 25) {
            gaugeFill.style.stroke = 'var(--neon-emerald)';
            indicator.classList.add('bg-green');
            statusSpan.textContent = 'STATUS: CLIN_STABLE';
            statusSpan.className = 'alert-status font-mono c-green';
        } else if (risk < 60) {
            gaugeFill.style.stroke = 'var(--neon-amber)';
            indicator.classList.add('bg-yellow');
            statusSpan.textContent = 'STATUS: MONITOR_ELEVATED';
            statusSpan.className = 'alert-status font-mono c-yellow';
        } else {
            gaugeFill.style.stroke = 'var(--neon-rose)';
            indicator.classList.add('bg-red');
            statusSpan.textContent = 'STATUS: CRITICAL_ALERT';
            statusSpan.className = 'alert-status font-mono c-rose';
        }
        
        // Update text logs
        if (matchedWords.length > 0) {
            textTokens.innerHTML = `Identified Triggers: <span class="c-rose">${matchedWords.join(', ')}</span><br>Embedding vectors altered.`;
        } else if (notes.trim().length > 0) {
            textTokens.innerHTML = `Vectorizing input text: "${notes.substring(0, 30)}..."<br>Embedding updated.`;
        } else {
            textTokens.innerHTML = `Embedding: [0.012, -0.452, 0.912, 0.088, ...]`;
        }
    }
    
    // Bind listeners
    ageSlider.addEventListener('input', updateRisk);
    sbpSlider.addEventListener('input', updateRisk);
    creatinineSlider.addEventListener('input', updateRisk);
    notesInput.addEventListener('input', updateRisk);
    
    // Initial calculate
    updateRisk();
}

/* ==========================================================================
   6. Grad-CAM X-Ray Scanner
   ========================================================================== */
function initGradCAMPlayground() {
    const btnPneumonia = document.getElementById('btn-pneumonia');
    const btnTb = document.getElementById('btn-tb');
    const opacitySlider = document.getElementById('gradcam-opacity');
    const overlay = document.getElementById('gradcam-overlay-layer');
    
    const targetClass = document.getElementById('xray-target-class');
    const confidence = document.getElementById('xray-confidence');
    const findingsDesc = document.getElementById('xray-findings-desc');
    
    let activePathology = 'pneumonia';
    
    const pathologyGradients = {
        pneumonia: 'radial-gradient(circle at 45% 65%, rgba(244, 63, 94, 0.8) 0%, rgba(245, 158, 11, 0.5) 25%, transparent 60%), radial-gradient(circle at 75% 70%, rgba(244, 63, 94, 0.8) 0%, rgba(245, 158, 11, 0.5) 25%, transparent 60%)',
        tb: 'radial-gradient(circle at 40% 35%, rgba(167, 139, 250, 0.85) 0%, rgba(0, 240, 255, 0.55) 30%, transparent 60%)'
    };
    
    function updateOverlay() {
        const opacity = opacitySlider.value / 100;
        overlay.style.background = pathologyGradients[activePathology];
        overlay.style.opacity = opacity;
    }
    
    btnPneumonia.addEventListener('click', () => {
        btnPneumonia.classList.add('active');
        btnTb.classList.remove('active');
        activePathology = 'pneumonia';
        
        targetClass.textContent = 'Pneumonia';
        targetClass.className = 'text-glow';
        confidence.textContent = '94.2%';
        confidence.className = 'text-glow-rose';
        findingsDesc.textContent = 'Model localizes high activation intensities in the bilateral lower lung zones, consistent with bronchopneumonic consolidations.';
        
        updateOverlay();
    });
    
    btnTb.addEventListener('click', () => {
        btnTb.classList.add('active');
        btnPneumonia.classList.remove('active');
        activePathology = 'tb';
        
        targetClass.textContent = 'Tuberculosis';
        targetClass.className = 'text-glow-violet';
        confidence.textContent = '87.9%';
        confidence.className = 'text-glow-rose';
        findingsDesc.textContent = 'Model highlights focal hyper-intensities localized in the left upper apex zone, typical of cavitary post-primary tuberculosis activity.';
        
        updateOverlay();
    });
    
    opacitySlider.addEventListener('input', updateOverlay);
    updateOverlay();
}

/* ==========================================================================
   7. 2D Path Solver (Dijkstra / A*)
   ========================================================================== */
class RouteSolver {
    constructor() {
        this.canvas = document.getElementById('route-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.isRunning = false;
        
        this.dijkstraMode = true; // false = A*
        this.setupListeners();
        this.resize();
    }
    
    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
        this.draw();
    }
    
    setupListeners() {
        this.canvas.addEventListener('click', (e) => {
            if (this.isRunning) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Add node
            if (this.nodes.length < 10) {
                this.nodes.push({ id: this.nodes.length, x, y });
                this.updateEdges();
                this.draw();
                this.log(`Node ${this.nodes.length - 1} added at (${Math.round(x)}, ${Math.round(y)})`);
            } else {
                this.log("Max limit (10 nodes) reached.");
            }
        });
        
        document.getElementById('btn-dijkstra').addEventListener('click', (e) => {
            e.target.classList.add('active');
            document.getElementById('btn-astar').classList.remove('active');
            this.dijkstraMode = true;
            this.log("Solver set to: Dijkstra");
        });
        
        document.getElementById('btn-astar').addEventListener('click', (e) => {
            e.target.classList.add('active');
            document.getElementById('btn-dijkstra').classList.remove('active');
            this.dijkstraMode = false;
            this.log("Solver set to: A* (Euclidean Heuristic)");
        });
        
        document.getElementById('btn-solve-route').addEventListener('click', () => this.solve());
        document.getElementById('btn-clear-route').addEventListener('click', () => this.clear());
    }
    
    updateEdges() {
        this.edges = [];
        // Connect nodes if distance < 160px to build a sparse grid/network
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                let dx = this.nodes[i].x - this.nodes[j].x;
                let dy = this.nodes[i].y - this.nodes[j].y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 160) {
                    this.edges.push({ u: i, v: j, weight: Math.round(dist) });
                }
            }
        }
    }
    
    draw(activeFrontier = [], finalPath = []) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(241, 245, 249, 0.02)';
        this.ctx.lineWidth = 1;
        const gridGap = 20;
        for (let x = 0; x < this.canvas.width; x += gridGap) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += gridGap) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Draw standard edges
        this.ctx.strokeStyle = 'rgba(241, 245, 249, 0.1)';
        this.ctx.lineWidth = 1.5;
        this.edges.forEach(edge => {
            const uNode = this.nodes[edge.u];
            const vNode = this.nodes[edge.v];
            this.ctx.beginPath();
            this.ctx.moveTo(uNode.x, uNode.y);
            this.ctx.lineTo(vNode.x, vNode.y);
            this.ctx.stroke();
        });
        
        // Draw active frontiers (being searched)
        this.ctx.strokeStyle = 'var(--neon-violet)';
        this.ctx.lineWidth = 3;
        activeFrontier.forEach(edge => {
            const uNode = this.nodes[edge.u];
            const vNode = this.nodes[edge.v];
            this.ctx.beginPath();
            this.ctx.moveTo(uNode.x, uNode.y);
            this.ctx.lineTo(vNode.x, vNode.y);
            this.ctx.stroke();
        });
        
        // Draw final solved path
        this.ctx.strokeStyle = 'var(--neon-cyan)';
        this.ctx.lineWidth = 4.5;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'var(--neon-cyan)';
        for (let i = 0; i < finalPath.length - 1; i++) {
            const uNode = this.nodes[finalPath[i]];
            const vNode = this.nodes[finalPath[i+1]];
            this.ctx.beginPath();
            this.ctx.moveTo(uNode.x, uNode.y);
            this.ctx.lineTo(vNode.x, vNode.y);
            this.ctx.stroke();
        }
        this.ctx.shadowBlur = 0; // reset
        
        // Draw nodes
        this.nodes.forEach((node, index) => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
            
            if (index === 0) {
                this.ctx.fillStyle = 'var(--neon-emerald)'; // start node
            } else if (index === this.nodes.length - 1 && this.nodes.length > 1) {
                this.ctx.fillStyle = 'var(--neon-rose)'; // end node
            } else {
                this.ctx.fillStyle = '#1e293b';
            }
            this.ctx.fill();
            
            this.ctx.strokeStyle = 'rgba(241, 245, 249, 0.4)';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
            
            // Label
            this.ctx.fillStyle = 'var(--text-muted)';
            this.ctx.font = '9px monospace';
            this.ctx.fillText(`N${node.id}`, node.x - 6, node.y - 12);
        });
    }
    
    log(msg) {
        const list = document.getElementById('path-logs-list');
        const li = document.createElement('li');
        li.textContent = `> ${msg}`;
        list.appendChild(li);
        list.scrollTop = list.scrollHeight;
    }
    
    clear() {
        this.nodes = [];
        this.edges = [];
        this.isRunning = false;
        this.draw();
        
        document.getElementById('path-nodes-count').textContent = '0';
        document.getElementById('path-total-distance').textContent = '0 px';
        document.getElementById('path-time-elapsed').textContent = 'Idle';
        
        const list = document.getElementById('path-logs-list');
        list.innerHTML = '<li>Waiting for node placement...</li>';
    }
    
    async solve() {
        if (this.isRunning) return;
        if (this.nodes.length < 2) {
            this.log("Place at least 2 nodes on grid first.");
            return;
        }
        
        this.isRunning = true;
        this.log("Initiating Path Search Optimization...");
        
        const start = 0;
        const end = this.nodes.length - 1;
        
        // Setup dijkstra stats
        let dist = Array(this.nodes.length).fill(Infinity);
        let prev = Array(this.nodes.length).fill(null);
        dist[start] = 0;
        
        let unvisited = [...Array(this.nodes.length).keys()];
        let frontierEdges = [];
        
        document.getElementById('path-time-elapsed').textContent = 'SEARCHING...';
        
        while (unvisited.length > 0) {
            // Find unvisited node with minimum distance
            unvisited.sort((a, b) => dist[a] - dist[b]);
            let current = unvisited[0];
            
            if (dist[current] === Infinity || current === end) {
                break;
            }
            
            unvisited.shift();
            
            // Explore neighbors
            let neighbors = this.edges.filter(e => e.u === current || e.v === current);
            for (let edge of neighbors) {
                let neighbor = edge.u === current ? edge.v : edge.u;
                if (!unvisited.includes(neighbor)) continue;
                
                // Animate frontier check
                frontierEdges.push(edge);
                this.draw(frontierEdges);
                this.log(`Testing edge N${current}-N${neighbor} (Dist: ${edge.weight})`);
                await new Promise(r => setTimeout(r, 450));
                
                let alt = dist[current] + edge.weight;
                
                // If A* mode, add simple straight line heuristic to weight estimate
                if (!this.dijkstraMode) {
                    const dx = this.nodes[neighbor].x - this.nodes[end].x;
                    const dy = this.nodes[neighbor].y - this.nodes[end].y;
                    const h = Math.round(Math.sqrt(dx*dx + dy*dy) * 0.5); // weak heuristic for visuals
                    alt += h;
                }
                
                if (alt < dist[neighbor]) {
                    dist[neighbor] = dist[current] + edge.weight;
                    prev[neighbor] = current;
                }
            }
        }
        
        // Reconstruct path
        let path = [];
        let curr = end;
        if (prev[curr] !== null || curr === start) {
            while (curr !== null) {
                path.unshift(curr);
                curr = prev[curr];
            }
        }
        
        this.isRunning = false;
        
        if (path.length > 0 && path[0] === start) {
            // Calculate actual distance
            let totalDist = 0;
            for (let i = 0; i < path.length - 1; i++) {
                const edge = this.edges.find(e => 
                    (e.u === path[i] && e.v === path[i+1]) || 
                    (e.u === path[i+1] && e.v === path[i])
                );
                if (edge) totalDist += edge.weight;
            }
            
            this.draw([], path);
            document.getElementById('path-nodes-count').textContent = path.length;
            document.getElementById('path-total-distance').textContent = `${totalDist} px`;
            document.getElementById('path-time-elapsed').textContent = 'CONVERGED';
            this.log(`Optimal Path Converged: ${path.map(n => 'N'+n).join(' ➔ ')}. Total Distance: ${totalDist} px`);
        } else {
            this.draw();
            document.getElementById('path-time-elapsed').textContent = 'UNREACHABLE';
            this.log("[ERROR] Target node unreachable from starting coordinates. Try adding intermediate bridging nodes.");
        }
    }
}

function initRouteOptimizer() {
    window.routeOptimizerInstance = new RouteSolver();
}

/* ==========================================================================
   8. Retro ML Command Console Terminal
   ========================================================================== */
function initTerminal() {
    const input = document.getElementById('terminal-input');
    const screen = document.getElementById('terminal-screen');
    
    // Auto-focus on click anywhere inside terminal
    document.querySelector('.terminal-container').addEventListener('click', () => {
        input.focus();
    });

    const commandHistory = [];
    
    const details = {
        about: `SURYA TEJA ANUPINDI - ML ENGINEER\n---------------------------------\nMS in Data Science (Saint Peter's University) & B.Tech in CSE.\nDesigning and deploying robust, explainable, and production-ready machine learning pipelines.\nFocus: Explainable NLP (RAG), Multimodal Neural Fusion (clinical metrics + clinical text embeddings), and Diagnostic Computer Vision.`,
        skills: `TECHNICAL SKILL MATRIX\n---------------------\n[Languages]: Python (NumPy, Pandas, Matplotlib), SQL, Java, C, R\n[Frameworks]: PyTorch, TensorFlow, Keras, HuggingFace Ecosystem\n[NLP/IR]: Transformers, DeBERTa, BERT, BM25, DPR, Reciprocal Rank Fusion\n[Vision/Graphs]: OpenCV, CNN Architectures, Grad-CAM, NetworkX`,
        projects: `ACTIVE PIPELINES & PROJECTS\n---------------------------\n1. ArgRAG (Argument-Aware Retrieval-Augmented Generation) - Python, PyTorch, Transformers.\n2. Multimodal Clinical Predictor (MIMIC-IV) - PyTorch, Clinical notes embeddings, SQLAlchemy.\n3. Radiograph Anomaly Detector - TensorFlow, OpenCV, Grad-CAM.\n4. Route Optimizer - Dijkstra & A* Path Planning.\nType 'train --model mlp' to test local model training loop.`,
        contact: `CONTACT PORTAL NODES\n--------------------\nEmail: reach2.anupindi@gmail.com\nLinkedIn: linkedin.com/in/surya-teja-anupindi\nGitHub: github.com/suryateja-anupindi`,
        help: `AVAILABLE COMMAND UTILITIES:\n  about     - Brief summary profile.\n  skills    - List core programming languages and ML frameworks.\n  projects  - Summarize advanced project pipelines.\n  contact   - Print communication channels.\n  train --model [mlp|cnn] - Simulates neural network model training.\n  clear     - Wipe console screen buffer.`
    };

    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const rawCmd = input.value.trim();
            input.value = '';
            
            if (rawCmd.length === 0) return;
            
            // Print command line prompt
            printLine(`sta@neuroshell:~$ ${rawCmd}`, 'prompt-echo');
            
            const tokens = rawCmd.split(' ');
            const baseCmd = tokens[0].toLowerCase();
            
            if (baseCmd === 'clear') {
                screen.innerHTML = '';
            } else if (baseCmd === 'help') {
                printLine(details.help);
            } else if (baseCmd === 'about') {
                printLine(details.about);
            } else if (baseCmd === 'skills') {
                printLine(details.skills);
            } else if (baseCmd === 'projects') {
                printLine(details.projects);
            } else if (baseCmd === 'contact') {
                printLine(details.contact);
            } else if (baseCmd === 'train') {
                const modelArg = tokens.indexOf('--model');
                let targetModel = 'mlp';
                if (modelArg !== -1 && tokens[modelArg + 1]) {
                    targetModel = tokens[modelArg + 1].toLowerCase();
                }
                
                if (targetModel !== 'mlp' && targetModel !== 'cnn') {
                    printLine("[ERROR] Unknown training model. Choose '--model mlp' or '--model cnn'.", 'c-rose');
                } else {
                    input.disabled = true;
                    await runTerminalTrainingSimulation(targetModel);
                    input.disabled = false;
                    input.focus();
                }
            } else {
                printLine(`sta@neuroshell: command not found: '${rawCmd}'. Type 'help' to audit available commands.`, 'c-rose');
            }
            
            screen.scrollTop = screen.scrollHeight;
        }
    });

    function printLine(text, className = '') {
        const line = document.createElement('div');
        line.className = `term-line ${className}`;
        line.innerText = text;
        screen.appendChild(line);
    }
    
    async function runTerminalTrainingSimulation(model) {
        printLine(`[INFO] Initializing ${model.toUpperCase()} Training Sequence...`, 'c-cyan');
        printLine(`[INFO] Compiling neural layers...`, 'c-gray');
        await new Promise(r => setTimeout(r, 600));
        
        let loss = model === 'mlp' ? 0.74 : 1.25;
        let accuracy = model === 'mlp' ? 52.1 : 33.4;
        
        const heroProgress = document.getElementById('hero-progress-bar');
        const heroAcc = document.getElementById('hero-metric-acc');
        const heroLoss = document.getElementById('hero-metric-loss');
        
        for (let epoch = 1; epoch <= 10; epoch++) {
            // progress training values
            if (model === 'mlp') {
                loss -= (loss * 0.28);
                accuracy += ((99 - accuracy) * 0.32);
            } else {
                loss -= (loss * 0.32);
                accuracy += ((99 - accuracy) * 0.36);
            }
            
            // Format metrics
            const lossStr = loss.toFixed(4);
            const accStr = accuracy.toFixed(2);
            
            printLine(`Epoch ${epoch}/10 - Loss: ${lossStr} - Acc: ${accStr}%`);
            
            // Dynamic updates to HUD dashboard in Hero section!
            if (heroProgress) heroProgress.style.width = `${accuracy}%`;
            if (heroAcc) heroAcc.textContent = `${Math.round(accuracy)}%`;
            if (heroLoss) heroLoss.textContent = lossStr;
            
            screen.scrollTop = screen.scrollHeight;
            await new Promise(r => setTimeout(r, 380));
        }
        
        printLine(`[SUCCESS] Model training convergent on weights. Evaluation matrix generated.`, 'c-green');
    }
}

/* ==========================================================================
   9. Mobile Responsive Menu
   ========================================================================== */
function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');
    
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        nav.classList.toggle('hide-mobile-active');
        
        if (nav.classList.contains('hide-mobile-active')) {
            nav.style.display = 'flex';
            nav.style.flexDirection = 'column';
            nav.style.position = 'absolute';
            nav.style.top = '70px';
            nav.style.left = '0';
            nav.style.width = '100%';
            nav.style.background = 'rgba(3, 7, 18, 0.95)';
            nav.style.padding = '2rem';
            nav.style.borderBottom = '1px solid rgba(241, 245, 249, 0.08)';
        } else {
            nav.removeAttribute('style');
        }
    });
}

/* ==========================================================================
   10. Contact Form Submissions
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const responseConsole = document.getElementById('form-response-console');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Animate submission
        form.classList.add('hide');
        responseConsole.classList.remove('hide');
    });
}
