class Folha {
    constructor() {
        this.reset();
        this.y = random(height);
    }

    reset() {
        this.x = random(width);
        this.y = random(-50, -10);
        this.velocidade = random(1, 2.5);
        this.tamanho = random(10, 18);
        this.angulo = random(TWO_PI);
        this.velRotacao = random(-0.01, 0.01);
        this.cor = color(random(50, 100), random(140, 190), random(60, 110), 160);
    }

    atualizar() {
        this.y += this.velocidade;
        this.x += sin(frameCount * 0.01) * 0.4;
        this.angulo += this.velRotacao;

        if (this.y > height) {
            this.reset();
        }
    }

    desenhar() {
        push();
        translate(this.x, this.y);
        rotate(this.angulo);
        noStroke();
        fill(this.cor);
        ellipse(0, 0, this.tamanho, this.tamanho / 2);
        pop();
    }
}

//Gabriel Rodrigues de Lima - Projeto Agrinho 2026