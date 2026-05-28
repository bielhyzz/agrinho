let estadoJogo = "MENU"; 
let folhas = [];
let tempoAnimacao = 0;

let moedas = 100; 
let producao = 40;
let sustentabilidade = 60;

let climaAtual = "LIMP"; 
let tempoClima = 0;

let dividaAtiva = 0;
let jurosTaxa = 0.15; 
let tempoParaCobrança = 0; 
let valorEmprestimoDisponivel = 0; 
let ofertaGerada = false;
let tipoCreditoOfertado = "Padrão"; 

let tempoSemPlantar = 0; 
let culturaSelecionada = "MILHO"; 

let abaAberta = "NENHUMA"; 

let colunas = 3;
let linhas = 3;
let gridTerrenos = [];
let tamanhoBloco = 120; 

let gridOffsetX = 480;  
let gridOffsetY = 150;

let listaFalas = [
    "Olá, parceiro! O desafio do Agrinho é manter o Agro Forte\ne o Futuro Sustentável. Vamos equilibrar a nossa\nprodução com o cuidado ao meio ambiente?",
    "E aí, bão? Sabia que usar a tecnologia certa ajuda a\ngente a colher mais sem gastar os recursos da natureza?\nBora testar isso na lavoura!",
    "Seja bem-vindo à nossa EcoFazenda! Aqui o progresso\ncaminha junto com a preservação. Se a gente cuidar da\nterra hoje, garantimos o futuro do Paraná amanhã!"
];
let falaAtual = "";


let temSensorIoT = false;
let temCisterna = false;
let temCurvaNivel = false;
let temDronePest = false;

let precoMilho = 50;
let precoSoja = 50;

let seguroContratado = false;

let abelhasAtivas = false;
let tempoAbelhaX = 0; 

let tempoAparicaoPraga = 0;
let blocoInfectadoX = -1;
let blocoInfectadoY = -1;
let tempoVidaPraga = 0;

function setup() {
    let canvas = createCanvas(1280, 600);
    canvas.parent('canvas-container');
    textFont('Fredoka');

    falaAtual = random(listaFalas);

    for (let i = 0; i < 25; i++) {
        folhas.push(new Folha());
    }

    for (let i = 0; i < colunas; i++) {
        gridTerrenos[i] = [];
        for (let j = 0; j < linhas; j++) {
            gridTerrenos[i][j] = {
                tipo: 0, 
                culturaAtual: "", 
                ultimaCulturaColhida: "", 
                tempoCrescimento: 0,
                temPraga: false
            };
        }
    }

    recalcularOfertaBanco();
}

function recalcularOfertaBanco() {
    let base = max(moedas, 100);
    
    if (sustentabilidade >= 80) {
        tipoCreditoOfertado = "PRONAF Bio";
        valorEmprestimoDisponivel = Math.round(base * 4.0); 
        jurosTaxa = 0.05; 
    } else {
        tipoCreditoOfertado = "Padrão";
        valorEmprestimoDisponivel = Math.round(base * random(1.5, 2.5));
        jurosTaxa = 0.15; 
    }
    ofertaGerada = true;
}

function draw() {
    if (estadoJogo === "MENU") {
        desenharMenu();
    } else if (estadoJogo === "FASE1") {
        jogabilidadeFase1();
    } else if (estadoJogo === "GAMEOVER") {
        desenharGameOver();
    }
}

function desenharMenu() {
    background("#87CEEB"); 
    cursor(ARROW);

    fill("#4CAF50"); noStroke();
    rect(0, 440, width, height - 440);

    for (let f of folhas) { f.atualizar(); f.desenhar(); }

    textAlign(CENTER, CENTER);
    fill("#1b5e20"); stroke(255); strokeWeight(6); textSize(64);
    text("ECOFAZENDA", width / 2, 100);
    
    noStroke(); fill("#ffb300"); textSize(24);
    text("Agro forte, futuro sustentável: equilíbrio entre produção e meio ambiente", width / 2, 160);

    desenharMascote(350, 460);

    fill(255); stroke("#2e7d32"); strokeWeight(2);
    rect(430, 235, 410, 95, 15);
    triangle(430, 280, 410, 290, 430, 295); 
    
    noStroke(); fill(0); textSize(14); textAlign(LEFT, CENTER);
    text(falaAtual, 450, 282);

    fill("#1b5e20"); rect(450, 220, 60, 22, 5);
    fill(255); textSize(12); textStyle(BOLD); text("TIÃO", 465, 231); textStyle(NORMAL);

    let btnX = width / 2 - 110; let btnY = 500;
    noStroke(); 
    if (mouseX > btnX && mouseX < btnX + 220 && mouseY > btnY && mouseY < btnY + 50) { fill("#ff9100"); cursor(HAND); } 
    else { fill("#ffb300"); cursor(ARROW); }
    rect(btnX, btnY, 220, 50, 25);
    fill(255); textAlign(CENTER, CENTER); textSize(20);
    text("INICIAR JORNADA", btnX + 110, btnY + 25);
}

function desenharMascote(x, y) {
    tempoAnimacao += 0.04;
    let respiracao = sin(tempoAnimacao) * 4;
    fill("#0288d1"); rect(x - 20, y - 50 + respiracao, 40, 50, 8);
    fill("#ffcc80"); rect(x + 18, y - 40 + respiracao, 10, 25, 4);
    fill("#00e676"); rect(x + 18, y - 35 + respiracao, 12, 6);
    fill("#ffcc80"); ellipse(x, y - 72 + respiracao, 48, 48);
    fill(0); ellipse(x - 8, y - 75 + respiracao, 5, 5); ellipse(x + 8, y - 75 + respiracao, 5, 5);
    noFill(); stroke(0); strokeWeight(2.5); arc(x, y - 66 + respiracao, 12, 8, 0, PI); noStroke();
    fill("#ffe082"); arc(x, y - 90 + respiracao, 54, 35, PI, 0); ellipse(x, y - 88 + respiracao, 80, 10);
    fill("#00e676"); rect(x - 27, y - 93 + respiracao, 54, 5);
}

function jogabilidadeFase1() {
    background("#f1f8e9"); 
    let cursorDefinido = false;

    tempoClima += 1;
    if (tempoClima >= 900) {
        let sorteio = random(["LIMP", "CHUVA", "SECA"]);
        climaAtual = sorteio;
        tempoClima = 0;

        if (climaAtual === "LIMP") { precoMilho = 50; precoSoja = 50; }
        if (climaAtual === "CHUVA") { precoMilho = 40; precoSoja = 45; } 
        if (climaAtual === "SECA") { precoMilho = 75; precoSoja = 80; }  
    }

    tempoAparicaoPraga += 1;
    let gatilhoPraga = temDronePest ? 10800 : 7200; 
    
    if (tempoAparicaoPraga >= gatilhoPraga && blocoInfectadoX === -1) {
        tempoAparicaoPraga = 0;
        let blocosValidos = [];
        for(let i=0; i<colunas; i++){
            for(let j=0; j<linhas; j++){
                if(gridTerrenos[i][j].tipo > 0 && !gridTerrenos[i][j].temPraga) {
                    blocosValidos.push({x: i, y: j});
                }
            }
        }
        if (blocosValidos.length > 0) {
            let sorteado = random(blocosValidos);
            blocoInfectadoX = sorteado.x;
            blocoInfectadoY = sorteado.y;
            gridTerrenos[blocoInfectadoX][blocoInfectadoY].temPraga = true;
            tempoVidaPraga = 0;
        }
    }

    if (blocoInfectadoX !== -1) {
        tempoVidaPraga += 1;
        if (tempoVidaPraga >= 900) { 
            gridTerrenos[blocoInfectadoX][blocoInfectadoY].tipo = 0;
            gridTerrenos[blocoInfectadoX][blocoInfectadoY].culturaAtual = "";
            gridTerrenos[blocoInfectadoX][blocoInfectadoY].tempoCrescimento = 0;
            gridTerrenos[blocoInfectadoX][blocoInfectadoY].temPraga = false;
            blocoInfectadoX = -1;
            blocoInfectadoY = -1;
            sustentabilidade = max(0, sustentabilidade - 5); 
        }
    }

    if (sustentabilidade >= 90) abelhasAtivas = true;
    else abelhasAtivas = false;

    if (dividaAtiva > 0) {
        tempoParaCobrança += 1;
        if (tempoParaCobrança >= 600) { 
            let jurosAcumulado = Math.round(dividaAtiva * jurosTaxa);
            dividaAtiva += jurosAcumulado;
            moedas -= jurosAcumulado; 
            tempoParaCobrança = 0;
        }
    }

    tempoSemPlantar += 1;
    if (tempoSemPlantar > 300) { 
        let fatorRegeneracao = map(tempoSemPlantar, 300, 1200, 0.02, 0.08, true);
        sustentabilidade = min(100, sustentabilidade + fatorRegeneracao);
    }

    if (moedas < 0) { estadoJogo = "GAMEOVER"; return; }

    fill(255); noStroke();
    rect(315, 15, width - 330, 80, 15);
    
    fill(240); rect(325, 27, 200, 56, 8);
    fill(0); textSize(14); textAlign(LEFT, CENTER); textStyle(BOLD);
    text("CLIMA DO PARANÁ:", 335, 44);
    textStyle(NORMAL);
    if (climaAtual === "LIMP") { fill("#ffb300"); text("☀️ Céu Limpo (Normal)", 335, 64); }
    if (climaAtual === "CHUVA") { fill("#1e88e5"); text("🌧️ Chuva (Cresce Dobro)", 335, 64); }
    if (climaAtual === "SECA") { fill("#f4511e"); text("🔥 Seca (Solo Ruim)", 335, 64); }

    fill(0); textSize(18); text(`💵 Carteira: $${moedas}`, 550, 55);
    if (dividaAtiva > 0) { fill("#d32f2f"); text(`🏦 Dívida: -$${dividaAtiva}`, 710, 55); }

    fill(0); textSize(14); text("🚜 Produção:", 870, 55);
    fill(220); rect(960, 47, 80, 16, 4);
    fill(50, 200, 50); rect(960, 47, map(producao, 0, 100, 0, 80), 16, 4);
    
    fill(0); text("🌳 Ecologia:", 1060, 55);
    fill(220); rect(1140, 47, 80, 16, 4);
    fill(sustentabilidade >= 80 ? "#2e7d32" : "#4caf50"); 
    rect(1140, 47, map(sustentabilidade, 0, 100, 0, 80), 16, 4);

    if (blocoInfectadoX !== -1 && frameCount % 30 < 15) {
        fill("#d32f2f"); textSize(14); textStyle(BOLD);
        text("⚠️ ALERTA: Lavoura Sofrendo Ataque de Pragas!", 550, 83);
    }

    for (let i = 0; i < colunas; i++) {
        for (let j = 0; j < linhas; j++) {
            let item = gridTerrenos[i][j];
            let bx = gridOffsetX + i * (tamanhoBloco + 25);
            let by = gridOffsetY + j * (tamanhoBloco + 25);

            if (item.tipo === 1 && !item.temPraga) {
                let velocidad = 1;
                if (climaAtual === "CHUVA") velocidad = 2; 
                if (climaAtual === "SECA") velocidad = temCisterna ? 0.8 : 0.5; 
                if (abelhasAtivas) velocidad *= 1.2;

                item.tempoCrescimento += velocidad;
                if (item.tempoCrescimento > 600) { item.tipo = 2; }
            }

            if (item.tipo === 0) fill("#8d6e63"); 
            if (item.tipo === 1) fill("#ffe082"); 
            if (item.tipo === 2) fill("#2e7d32"); 

            if (item.temPraga) { stroke("#d32f2f"); strokeWeight(4); } 
            else { stroke(255); strokeWeight(3); }
            rect(bx, by, tamanhoBloco, tamanhoBloco, 12);

            noStroke(); textAlign(CENTER, CENTER); textSize(36); textStyle(NORMAL);
            if (item.tipo === 1) text("🌱", bx + tamanhoBloco/2, by + tamanhoBloco/2);
            if (item.tipo === 2) {
                if (item.culturaAtual === "MILHO") text("🌽", bx + tamanhoBloco/2, by + tamanhoBloco/2);
                if (item.culturaAtual === "SOJA") text("🌿", bx + tamanhoBloco/2, by + tamanhoBloco/2);
            }

            if (item.temPraga) {
                textSize(26);
                text("🐛", bx + tamanhoBloco - 25, by + 25);
            }

            if (abaAberta === "NENHUMA") {
                if (mouseX > bx && mouseX < bx + tamanhoBloco && mouseY > by && mouseY < by + tamanhoBloco) {
                    cursor(HAND); cursorDefinido = true;
                }
            }
        }
    }

    let sideW = 280;
    fill("#1b5e20"); noStroke();
    rect(0, 0, sideW, height);
    fill("#144d18"); rect(sideW - 5, 0, 5, height); 

    fill(255); textAlign(LEFT, TOP); textSize(18); textStyle(BOLD);
    text("🚜 GESTÃO AGRÍCOLA", 25, 25);
    stroke("rgba(255,255,255,0.15)"); line(25, 55, sideW - 25, 55); noStroke();

    let l1Y = 75;
    if (abaAberta === "SEMENTES") fill("#2e7d32"); else fill("rgba(255,255,255,0.05)");
    if (mouseX > 20 && mouseX < sideW - 20 && mouseY > l1Y && mouseY < l1Y + 40) { fill("rgba(255,255,255,0.15)"); cursor(HAND); cursorDefinido = true; }
    rect(20, l1Y, sideW - 40, 40, 8); fill(255); textSize(13); textAlign(LEFT, CENTER); textStyle(BOLD);
    text("🌱 Escolher Sementes", 35, l1Y + 20); text(culturaSelecionada === "MILHO" ? "🌽" : "🌿", sideW - 45, l1Y + 20);

    let l2Y = 125;
    if (abaAberta === "BANCO") fill("#2e7d32"); else fill("rgba(255,255,255,0.05)");
    if (mouseX > 20 && mouseX < sideW - 20 && mouseY > l2Y && mouseY < l2Y + 40) { fill("rgba(255,255,255,0.15)"); cursor(HAND); cursorDefinido = true; }
    rect(20, l2Y, sideW - 40, 40, 8); fill(255); textSize(13); textAlign(LEFT, CENTER); textStyle(BOLD);
    text("🏦 Banco e Seguro", 35, l2Y + 20);
    if (seguroContratado) { fill("#64b5f6"); rect(sideW - 48, l2Y + 13, 14, 14, 3); fill(255); textSize(9); textStyle(NORMAL); text("🛡️", sideW - 45, l2Y + 21); }
    if (sustentabilidade >= 80) { fill("#ffb300"); rect(sideW - 95, l2Y + 12, 42, 16, 4); fill(0); textSize(8); textStyle(BOLD); text("PRONAF", sideW - 91, l2Y + 21); }

    let l3Y = 175;
    if (abaAberta === "MERCADO") fill("#2e7d32"); else fill("rgba(255,255,255,0.05)");
    if (mouseX > 20 && mouseX < sideW - 20 && mouseY > l3Y && mouseY < l3Y + 40) { fill("rgba(255,255,255,0.15)"); cursor(HAND); cursorDefinido = true; }
    rect(20, l3Y, sideW - 40, 40, 8); fill(255); textSize(13); textAlign(LEFT, CENTER); textStyle(BOLD);
    text("📉 Mercado & Cotações", 35, l3Y + 20);

    let l4Y = 225;
    if (abaAberta === "TECH") fill("#2e7d32"); else fill("rgba(255,255,255,0.05)");
    if (mouseX > 20 && mouseX < sideW - 20 && mouseY > l4Y && mouseY < l4Y + 40) { fill("rgba(255,255,255,0.15)"); cursor(HAND); cursorDefinido = true; }
    rect(20, l4Y, sideW - 40, 40, 8); fill(255); textSize(13); textAlign(LEFT, CENTER); textStyle(BOLD);
    text("🔬 Tecnologia & Upgrades", 35, l4Y + 20);

    let l5Y = 275;
    if (abaAberta === "DEFESA") fill("#2e7d32"); else fill("rgba(255,255,255,0.05)");
    if (blocoInfectadoX !== -1) { fill("rgba(211, 47, 47, 0.2)"); } 
    if (mouseX > 20 && mouseX < sideW - 20 && mouseY > l5Y && mouseY < l5Y + 40) { fill("rgba(255,255,255,0.15)"); cursor(HAND); cursorDefinido = true; }
    rect(20, l5Y, sideW - 40, 40, 8); fill(255); textSize(13); textAlign(LEFT, CENTER); textStyle(BOLD);
    text(blocoInfectadoX !== -1 ? "🪲 Defesa da Lavoura ⚠️" : "🔨 Defesa da Lavoura", 35, l5Y + 20);

    fill("#a5d6a7"); textSize(11); textAlign(CENTER, CENTER); textStyle(NORMAL);
    text("Painel de Controle v3.1 (MIP Ajustado)\nClique nas abas para gerenciar.", sideW / 2, height - 35);

    if (abelhasAtivas) {
        tempoAbelhaX += 0.02;
        let abelhaY = 320 + sin(tempoAbelhaX * 4) * 35;
        let abelhaX = (tempoAbelhaX * 80) % (width + 50) - 30; 
        
        noStroke(); textSize(24); textAlign(CENTER, CENTER); textStyle(NORMAL);
        text("🐝", abelhaX, abelhaY);
        
        fill("rgba(46, 125, 50, 0.9)"); rect(1020, 105, 235, 25, 5);
        fill(255); textSize(11); textStyle(BOLD); text("🐝 Polinização Ativa: +20% Crescimento", 1137, 117);
    }

    if (abaAberta !== "NENHUMA") {
        fill(0, 120);
        rect(sideW, 0, width - sideW, height);

        let cxW = 540; let cxH = 420;
        let cxX = sideW + (width - sideW) / 2 - cxW / 2;
        let cxY = height / 2 - cxH / 2;

        fill(255); stroke("#2e7d32"); strokeWeight(3);
        rect(cxX, cxY, cxW, cxH, 16);
        noStroke();

        let fecharX = cxX + cxW - 35; let fecharY = cxY + 20;
        if (mouseX > fecharX && mouseX < fecharX + 25 && mouseY > fecharY && mouseY < fecharY + 25) {
            fill("#e53935"); cursor(HAND); cursorDefinido = true;
        } else fill(120);
        textSize(20); textStyle(BOLD); textAlign(LEFT, TOP); text("X", fecharX, fecharY); textStyle(NORMAL);

        if (abaAberta === "SEMENTES") {
            fill(0); textSize(20); textStyle(BOLD); text("Catálogo de Sementes Ativas", cxX + 35, cxY + 30);
            fill(100); textSize(13); textStyle(NORMAL); text("Selecione qual cultura deseja carregar na sua semeadora:", cxX + 35, cxY + 58);

            let boxM_X = cxX + 35; let boxM_Y = cxY + 100;
            if (culturaSelecionada === "MILHO") { fill("#fff8e1"); stroke("#ffb300"); strokeWeight(2); } else { fill(245); stroke(220); strokeWeight(1); }
            rect(boxM_X, boxM_Y, 470, 90, 10); noStroke();
            if (mouseX > boxM_X && mouseX < boxM_X + 470 && mouseY > boxM_Y && mouseY < boxM_Y + 90) { cursor(HAND); cursorDefinido = true; }
            fill(0); textSize(16); textStyle(BOLD); text("🌽 Cultura de Milho Safrinha", boxM_X + 20, boxM_Y + 25);
            fill(80); textStyle(NORMAL); textSize(13); text("Custo de Plantio: $20 | Retorno Base: $50\nDesenvolve bem e gera alta taxa de produção.", boxM_X + 20, boxM_Y + 48);

            let boxS_X = cxX + 35; let boxS_Y = cxY + 210;
            if (culturaSelecionada === "SOJA") { fill("#e8f5e9"); stroke("#4CAF50"); strokeWeight(2); } else { fill(245); stroke(220); strokeWeight(1); }
            rect(boxS_X, boxS_Y, 470, 90, 10); noStroke();
            if (mouseX > boxS_X && mouseX < boxS_X + 470 && mouseY > boxS_Y && mouseY < boxS_Y + 90) { cursor(HAND); cursorDefinido = true; }
            fill(0); textSize(16); textStyle(BOLD); text("🌿 Cultura de Soja Transgênica", boxS_X + 20, boxS_Y + 25);
            fill(80); textStyle(NORMAL); textSize(13); text("Custo de Plantio: $20 | Retorno Base: $50\nExcelente fixadora de nitrogênio. Essencial para Rotação!", boxS_X + 20, boxS_Y + 48);
        }

        if (abaAberta === "BANCO") {
            fill(0); textSize(20); textStyle(BOLD); text("Cooperativa de Crédito Rural", cxX + 35, cxY + 30);
            
            if (tipoCreditoOfertado === "PRONAF Bio") {
                fill("#e8f5e9"); rect(cxX + 35, cxY + 60, 470, 30, 6);
                fill("#2e7d32"); textSize(12); textStyle(BOLD); text("🎉 CRÉDITO PRONAF BIO LIBERADO (Ecologia > 80%)", cxX + 45, cxY + 68);
            } else {
                fill(100); textSize(13); textStyle(NORMAL); text("Mantenha a Ecologia alta para liberar juros subsidiados pelo PRONAF.", cxX + 35, cxY + 68);
            }

            fill(248); rect(cxX + 35, cxY + 105, 470, 110, 8);
            fill(50); textStyle(NORMAL); textSize(14);
            text(`• Modalidade Ofertada: ${tipoCreditoOfertado}\n• Valor Limite Financiado: $${valorEmprestimoDisponivel}\n• Taxa de Juros do Banco: ${jurosTaxa * 100}% por turno`, cxX + 55, cxY + 125);

            let b1X = cxX + 35; let b1Y = cxY + 235;
            if (dividaAtiva === 0) {
                if (mouseX > b1X && mouseX < b1X + 220 && mouseY > b1Y && mouseY < b1Y + 45) { fill("#2e7d32"); cursor(HAND); cursorDefinido = true; } 
                else fill("#4CAF50");
            } else fill(180);
            rect(b1X, b1Y, 220, 45, 8);
            fill(255); textStyle(BOLD); textSize(13); textAlign(CENTER, CENTER); text("PEGAR EMPRÉSTIMO", b1X + 110, b1Y + 22);

            let b2X = cxX + 285; let b2Y = cxY + 235;
            if (dividaAtiva > 0) {
                if (mouseX > b2X && mouseX < b2X + 220 && mouseY > b2Y && mouseY < b2Y + 45) { fill("#c62828"); cursor(HAND); cursorDefinido = true; } 
                else fill("#ef5350");
            } else fill(180);
            rect(b2X, b2Y, 220, 45, 8);
            fill(255); textStyle(BOLD); textSize(13); textAlign(CENTER, CENTER); text("QUITAR DÍVIDA", b2X + 110, b2Y + 22);

            fill(0); textSize(14); textStyle(BOLD); textAlign(LEFT, CENTER);
            text("🛡️ Programa de Proteção de Clima (Seguro)", cxX + 35, cxY + 315);
            textSize(12); textStyle(NORMAL); fill(100);
            text(seguroContratado ? "Seguro Ativo! Próxima colheita na Seca está protegida." : "Custo: $15 | Garante preço cheio ($50) sob efeitos de Seca.", cxX + 35, cxY + 342);
            
            let btnSegX = cxX + 390; let btnSegY = cxY + 302;
            if (!seguroContratado && moedas >= 15) {
                if (mouseX > btnSegX && mouseX < btnSegX + 115 && mouseY > btnSegY && mouseY < btnSegY + 28) { fill("#1e88e5"); cursor(HAND); cursorDefinido = true; }
                else fill("#4caf50");
            } else fill(180);
            rect(btnSegX, btnSegY, 115, 28, 5); fill(255); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(12);
            text(seguroContratado ? "ATIVADO" : "CONTRATAR", btnSegX + 57, btnSegY + 14);
        }

        if (abaAberta === "MERCADO") {
            fill(0); textSize(20); textStyle(BOLD); text("Bolsa de Commodities Agrícolas", cxX + 35, cxY + 30);
            fill(100); textSize(13); textStyle(NORMAL); text("Preços oscilam em tempo real de acordo com as condições climáticas:", cxX + 35, cxY + 55);

            fill(245); rect(cxX + 35, cxY + 90, 470, 80, 10);
            fill(0); textSize(16); textStyle(BOLD); textAlign(LEFT, CENTER); text("🌽 Cotação do Milho (Saca)", cxX + 55, cxY + 130);
            textSize(22); textStyle(BOLD); fill(climaAtual === "SECA" ? "#2e7d32" : 0); text(`$${precoMilho}`, cxX + 400, cxY + 130);
            textSize(12); fill(100); textStyle(NORMAL); text(climaAtual === "SECA" ? "🔼 Alta por Escassez" : climaAtual === "CHUVA" ? "🔽 Baixa por Superprodução" : "⚡ Estável", cxX + 55, cxY + 152);

            fill(245); rect(cxX + 35, cxY + 190, 470, 80, 10);
            fill(0); textSize(16); textStyle(BOLD); textAlign(LEFT, CENTER); text("🌿 Cotação da Soja (Saca)", cxX + 55, cxY + 230);
            textSize(22); textStyle(BOLD); fill(climaAtual === "SECA" ? "#2e7d32" : 0); text(`$${precoSoja}`, cxX + 400, cxY + 230);
            textSize(12); fill(100); textStyle(NORMAL); text(climaAtual === "SECA" ? "🔼 Alta por Escassez" : climaAtual === "CHUVA" ? "🔽 Baixa por Superprodução" : "⚡ Estável", cxX + 55, cxY + 252);
        }

        if (abaAberta === "TECH") {
            fill(0); textSize(20); textStyle(BOLD); text("Centro de Tecnologia de Precisão", cxX + 35, cxY + 25);
            fill(100); textSize(13); textStyle(NORMAL); text("Modernize sua propriedade para mitigar riscos ambientais:", cxX + 35, cxY + 48);

            fill(temSensorIoT ? "#e8f5e9" : 245); rect(cxX + 35, cxY + 75, 470, 75, 8);
            fill(0); textSize(13); textStyle(BOLD); textAlign(LEFT, CENTER); text("📡 Sensores de Solo IoT (Custo: $40)", cxX + 50, cxY + 98);
            textSize(11); textStyle(NORMAL); fill(80); text("Reduz o desgaste ecológico ao plantar em qualquer clima.", cxX + 50, cxY + 122);
            if (!temSensorIoT) {
                if (mouseX > cxX + 375 && mouseX < cxX + 485 && mouseY > cxY + 88 && mouseY < cxY + 116) { fill("#1b5e20"); cursor(HAND); cursorDefinido = true; } else fill("#2e7d32");
                rect(cxX + 380, cxY + 88, 105, 28, 5); fill(255); textAlign(CENTER, CENTER); textStyle(BOLD); text("COMPRAR", cxX + 432, cxY + 102);
            } else { fill(120); textAlign(CENTER, CENTER); textStyle(BOLD); text("ATIVO ✔️", cxX + 432, cxY + 102); }

            fill(temCisterna ? "#e8f5e9" : 245); rect(cxX + 35, cxY + 160, 470, 75, 8);
            fill(0); textSize(13); textStyle(BOLD); textAlign(LEFT, CENTER); text("💧 Cisternas de Água (Custo: $50)", cxX + 50, cxY + 183);
            textSize(11); textStyle(NORMAL); fill(80); text("Acelera a velocidade de crescimento no período de Seca.", cxX + 50, cxY + 207);
            if (!temCisterna) {
                if (mouseX > cxX + 375 && mouseX < cxX + 485 && mouseY > cxY + 173 && mouseY < cxY + 201) { fill("#1b5e20"); cursor(HAND); cursorDefinido = true; } else fill("#2e7d32");
                rect(cxX + 380, cxY + 173, 105, 28, 5); fill(255); textAlign(CENTER, CENTER); textStyle(BOLD); text("COMPRAR", cxX + 432, cxY + 187);
            } else { fill(120); textAlign(CENTER, CENTER); textStyle(BOLD); text("ATIVO ✔️", cxX + 432, cxY + 187); }

            fill(temCurvaNivel ? "#e8f5e9" : 245); rect(cxX + 35, cxY + 245, 470, 75, 8);
            fill(0); textSize(13); textStyle(BOLD); textAlign(LEFT, CENTER); text("⛰️ Curvas de Nível (Custo: $40)", cxX + 50, cxY + 268);
            textSize(11); textStyle(NORMAL); fill(80); text("Aumenta o bônus de regeneração do solo na rotação.", cxX + 50, cxY + 292);
            if (!temCurvaNivel) {
                if (mouseX > cxX + 375 && mouseX < cxX + 485 && mouseY > cxY + 258 && mouseY < cxY + 286) { fill("#1b5e20"); cursor(HAND); cursorDefinido = true; } else fill("#2e7d32");
                rect(cxX + 380, cxY + 258, 105, 28, 5); fill(255); textAlign(CENTER, CENTER); textStyle(BOLD); text("COMPRAR", cxX + 432, cxY + 272);
            } else { fill(120); textAlign(CENTER, CENTER); textStyle(BOLD); text("ATIVO ✔️", cxX + 432, cxY + 272); }

            fill(temDronePest ? "#e8f5e9" : 245); rect(cxX + 35, cxY + 330, 470, 75, 8);
            fill(0); textSize(13); textStyle(BOLD); textAlign(LEFT, CENTER); text("🛸 Drone de Monitoramento (Custo: $55)", cxX + 50, cxY + 353);
            textSize(11); textStyle(NORMAL); fill(80); text("Tecnologia de precisão que amplia o tempo seguro sem pragas para 3 min.", cxX + 50, cxY + 377);
            if (!temDronePest) {
                if (mouseX > cxX + 375 && mouseX < cxX + 485 && mouseY > cxY + 343 && mouseY < cxY + 371) { fill("#1b5e20"); cursor(HAND); cursorDefinido = true; } else fill("#2e7d32");
                rect(cxX + 380, cxY + 343, 105, 28, 5); fill(255); textAlign(CENTER, CENTER); textStyle(BOLD); text("COMPRAR", cxX + 432, cxY + 357);
            } else { fill(120); textAlign(CENTER, CENTER); textStyle(BOLD); text("ATIVO ✔️", cxX + 432, cxY + 357); }
        }

        if (abaAberta === "DEFESA") {
            fill(0); textSize(20); textStyle(BOLD); text("Manejo Integrado de Pragas (MIP)", cxX + 35, cxY + 30);
            fill(100); textSize(13); textStyle(NORMAL); text("Monitore e combata infestações escolhendo sua estratégia:", cxX + 35, cxY + 55);

            fill(245); rect(cxX + 35, cxY + 80, 470, 55, 8);
            fill(0); textSize(13); textStyle(BOLD); textAlign(LEFT, CENTER);
            if (blocoInfectadoX !== -1) {
                fill("#d32f2f"); text(`🐛 ATENÇÃO: Terreno [Col: ${blocoInfectadoX+1}, Lin: ${blocoInfectadoY+1}] sob ataque!`, cxX + 50, cxY + 108);
            } else {
                fill("#2e7d32"); text("✨ Lavoura limpa. Nenhuma infestação detectada no momento.", cxX + 50, cxY + 108);
            }

            // Tratamento Químico
            fill(245); rect(cxX + 35, cxY + 155, 470, 100, 10);
            fill(0); textSize(15); textStyle(BOLD); text("🧪 Defensivo Químico Tradicional", cxX + 50, cxY + 180);
            fill(80); textStyle(NORMAL); textSize(12); text("Custo: $10 | Elimina a praga imediatamente.\n⚠️ Impacto Colateral: Prejudica a saúde do solo (-15 Ecologia).", cxX + 50, cxY + 208);
            
            let btnQ_X = cxX + 380; let btnQ_Y = cxY + 170;
            if (blocoInfectadoX !== -1 && moedas >= 10) {
                if (mouseX > btnQ_X && mouseX < btnQ_X + 105 && mouseY > btnQ_Y && mouseY < btnQ_Y + 32) { fill("#c62828"); cursor(HAND); cursorDefinido = true; } else fill("#ef5350");
            } else fill(180);
            rect(btnQ_X, btnQ_Y, 105, 32, 6); fill(255); textAlign(CENTER, CENTER); textStyle(BOLD); text("APLICAR", btnQ_X + 52, btnQ_Y + 16);

            // Tratamento Biológico
            fill(245); rect(cxX + 35, cxY + 275, 470, 100, 10);
            fill(0); textSize(15); textStyle(BOLD); textAlign(LEFT, CENTER); text("🪲 Controle Biológico Sustentável", cxX + 50, cxY + 300);
            fill(80); textStyle(NORMAL); textSize(12); text("Custo: $25 | Introduz predadores naturais para conter a praga.\n🌳 Bônus Ecológico: Fortalece o meio ambiente (+5 Ecologia).", cxX + 50, cxY + 330);
            
            let btnB_X = cxX + 380; let btnB_Y = cxY + 290;
            if (blocoInfectadoX !== -1 && moedas >= 25) {
                if (mouseX > btnB_X && mouseX < btnB_X + 105 && mouseY > btnB_Y && mouseY < btnB_Y + 32) { fill("#1b5e20"); cursor(HAND); cursorDefinido = true; } else fill("#4caf50");
            } else fill(180);
            rect(btnB_X, btnB_Y, 105, 32, 6); fill(255); textAlign(CENTER, CENTER); textStyle(BOLD); text("APLICAR", btnB_X + 52, btnB_Y + 16);
        }
    }

    if (!cursorDefinido) cursor(ARROW);
}

function desenharGameOver() {
    background("#212121"); cursor(ARROW);
    textAlign(CENTER, CENTER); fill("#e53935"); textSize(55); textStyle(BOLD);
    text("FALÊNCIA FINANCEIRA!", width / 2, height / 2 - 40);
    fill(255); textSize(18); textStyle(NORMAL);
    text("No agronegócio paranaense, equilibrar os investimentos é vital.\nAs dívidas acumularam e sua reserva quebrou!", width / 2, height / 2 + 30);
    let rX = width / 2 - 120; let rY = height / 2 + 110;
    if (mouseX > rX && mouseX < rX + 240 && mouseY > rY && mouseY < rY + 50) { fill("#4CAF50"); cursor(HAND); } else fill("#1b5e20");
    rect(rX, rY, 240, 50, 10);
    fill(255); textSize(16); textStyle(BOLD); text("TENTAR NOVAMENTE", rX + 120, rY + 25); textStyle(NORMAL);
}

function mousePressed() {
    if (estadoJogo === "MENU") {
        let btnX = width / 2 - 110; let btnY = 500;
        if (mouseX > btnX && mouseX < btnX + 220 && mouseY > btnY && mouseY < btnY + 50) { estadoJogo = "FASE1"; }
    } 
    else if (estadoJogo === "FASE1") {
        let sideW = 280;

        if (abaAberta !== "NENHUMA") {
            let cxW = 540; let cxH = 420;
            let cxX = sideW + (width - sideW) / 2 - cxW / 2;
            let cxY = height / 2 - cxH / 2;

            let fecharX = cxX + cxW - 35; let fecharY = cxY + 20;
            if (mouseX > fecharX && mouseX < fecharX + 25 && mouseY > fecharY && mouseY < fecharY + 25) {
                abaAberta = "NENHUMA";
                return;
            }

            if (abaAberta === "SEMENTES") {
                if (mouseX > cxX + 35 && mouseX < cxX + 485 && mouseY > cxY + 100 && mouseY < cxY + 190) { culturaSelecionada = "MILHO"; abaAberta = "NENHUMA"; }
                if (mouseX > cxX + 35 && mouseX < cxX + 485 && mouseY > cxY + 210 && mouseY < cxY + 300) { culturaSelecionada = "SOJA"; abaAberta = "NENHUMA"; }
                return;
            }

            if (abaAberta === "BANCO") {
                let b1X = cxX + 35; let b1Y = cxY + 235;
                let b2X = cxX + 275; let b2Y = cxY + 235;

                if (mouseX > b1X && mouseX < b1X + 220 && mouseY > b1Y && mouseY < b1Y + 45) {
                    if (dividaAtiva === 0 && ofertaGerada) { moedas += valorEmprestimoDisponivel; dividaAtiva = valorEmprestimoDisponivel; tempoParaCobrança = 0; ofertaGerada = false; abaAberta = "NENHUMA"; }
                }
                if (mouseX > b2X && mouseX < b2X + 220 && mouseY > b2Y && mouseY < b2Y + 45) {
                    if (dividaAtiva > 0 && moedas >= dividaAtiva) { moedas -= dividaAtiva; dividaAtiva = 0; recalcularOfertaBanco(); abaAberta = "NENHUMA"; }
                }
                let btnSegX = cxX + 390; let btnSegY = cxY + 302;
                if (mouseX > btnSegX && mouseX < btnSegX + 115 && mouseY > btnSegY && mouseY < btnSegY + 330) {
                    if (!seguroContratado && moedas >= 15) { moedas -= 15; seguroContratado = true; }
                }
                return;
            }

            if (abaAberta === "TECH") {
                if (mouseX > cxX + 380 && mouseX < cxX + 485 && mouseY > cxY + 88 && mouseY < cxY + 116) {
                    if (!temSensorIoT && moedas >= 40) { moedas -= 40; temSensorIoT = true; }
                }
                if (mouseX > cxX + 380 && mouseX < cxX + 485 && mouseY > cxY + 173 && mouseY < cxY + 201) {
                    if (!temCisterna && moedas >= 50) { moedas -= 50; temCisterna = true; }
                }
                if (mouseX > cxX + 380 && mouseX < cxX + 485 && mouseY > cxY + 258 && mouseY < cxY + 286) {
                    if (!temCurvaNivel && moedas >= 40) { moedas -= 40; temCurvaNivel = true; }
                }
                if (mouseX > cxX + 380 && mouseX < cxX + 485 && mouseY > cxY + 343 && mouseY < cxY + 371) {
                    if (!temDronePest && moedas >= 55) { moedas -= 55; temDronePest = true; }
                }
                return;
            }

            if (abaAberta === "DEFESA") {
                let btnQ_X = cxX + 380; let btnQ_Y = cxY + 170;
                let btnB_X = cxX + 380; let btnB_Y = cxY + 290;

                if (mouseX > btnQ_X && mouseX < btnQ_X + 105 && mouseY > btnQ_Y && mouseY < btnQ_Y + 32) {
                    if (blocoInfectadoX !== -1 && moedas >= 10) {
                        moedas -= 10;
                        sustentabilidade = max(0, sustentabilidade - 15); 
                        gridTerrenos[blocoInfectadoX][blocoInfectadoY].temPraga = false;
                        blocoInfectadoX = -1; blocoInfectadoY = -1;
                        abaAberta = "NENHUMA";
                    }
                }
                if (mouseX > btnB_X && mouseX < btnB_X + 105 && mouseY > btnB_Y && mouseY < btnB_Y + 32) {
                    if (blocoInfectadoX !== -1 && moedas >= 25) {
                        moedas -= 25;
                        sustentabilidade = min(100, sustentabilidade + 5); 
                        gridTerrenos[blocoInfectadoX][blocoInfectadoY].temPraga = false;
                        blocoInfectadoX = -1; blocoInfectadoY = -1;
                        abaAberta = "NENHUMA";
                    }
                }
                return;
            }
            return; 
        }

        if (mouseX > 20 && mouseX < sideW - 20 && mouseY > 75 && mouseY < 115) { abaAberta = "SEMENTES"; return; }
        if (mouseX > 20 && mouseX < sideW - 20 && mouseY > 125 && mouseY < 165) { abaAberta = "BANCO"; return; }
        if (mouseX > 20 && mouseX < sideW - 20 && mouseY > 175 && mouseY < 215) { abaAberta = "MERCADO"; return; }
        if (mouseX > 20 && mouseX < sideW - 20 && mouseY > 225 && mouseY < 265) { abaAberta = "TECH"; return; }
        if (mouseX > 20 && mouseX < sideW - 20 && mouseY > 275 && mouseY < 315) { abaAberta = "DEFESA"; return; }

        for (let i = 0; i < colunas; i++) {
            for (let j = 0; j < linhas; j++) {
                let item = gridTerrenos[i][j];
                let bx = gridOffsetX + i * (tamanhoBloco + 25);
                let by = gridOffsetY + j * (tamanhoBloco + 25);

                if (mouseX > bx && mouseX < bx + tamanhoBloco && mouseY > by && mouseY < by + tamanhoBloco) {
                    
                    if (item.tipo === 0 && moedas >= 20) {
                        item.tipo = 1;
                        item.tempoCrescimento = 0;
                        item.culturaAtual = culturaSelecionada;
                        moedas -= 20;
                        
                        let impactoSolo = temSensorIoT ? 3 : 4;
                        if (climaAtual === "SECA") impactoSolo = temSensorIoT ? 5 : 7; 
                        
                        sustentabilidade = max(0, sustentabilidade - impactoSolo); 
                        tempoSemPlantar = 0; 
                    } 
                    else if (item.tipo === 2) {
                        if (item.temPraga) {
                            abaAberta = "DEFESA"; 
                            return;
                        }

                        item.tipo = 0; 
                        let ganhoFinal = (item.culturaAtual === "MILHO") ? precoMilho : precoSoja;
                        
                        if (climaAtual === "SECA" && seguroContratado) {
                            ganhoFinal = 50; 
                            seguroContratado = false; 
                        }
                        
                        moedas += ganhoFinal;  
                        producao = min(100, producao + 5);
                        
                        if (item.ultimaCulturaColhida !== "" && item.ultimaCulturaColhida !== item.culturaAtual) {
                            let bonusSolo = temCurvaNivel ? 16 : 12;
                            sustentabilidade = min(100, sustentabilidade + bonusSolo); 
                        }
                        
                        item.ultimaCulturaColhida = item.culturaAtual;
                        item.culturaAtual = "";
                        
                        if (dividaAtiva === 0) recalcularOfertaBanco();
                    }
                }
            }
        }
    }
    else if (estadoJogo === "GAMEOVER") {
        let rX = width / 2 - 120; let rY = height / 2 + 110;
        if (mouseX > rX && mouseX < rX + 240 && mouseY > rY && mouseY < rY + 50) {
            moedas = 100; dividaAtiva = 0; producao = 40; sustentabilidade = 60;
            tempoParaCobrança = 0; tempoSemPlantar = 0; abaAberta = "NENHUMA"; climaAtual = "LIMP";
            temSensorIoT = false; temCisterna = false; temCurvaNivel = false; temDronePest = false;
            seguroContratado = false; abelhasAtivas = false;
            blocoInfectadoX = -1; blocoInfectadoY = -1; tempoAparicaoPraga = 0;
            for (let i = 0; i < colunas; i++) {
                for (let j = 0; j < linhas; j++) {
                    gridTerrenos[i][j].tipo = 0;
                    gridTerrenos[i][j].culturaAtual = "";
                    gridTerrenos[i][j].ultimaCulturaColhida = "";
                    gridTerrenos[i][j].tempoCrescimento = 0;
                    gridTerrenos[i][j].temPraga = false;
                }
            }
            estadoJogo = "MENU"; falaAtual = random(listaFalas); 
            recalcularOfertaBanco(); 
        }
    }
}

//Gabriel Rodrigues de Lima - Projeto Agrinho 2026
