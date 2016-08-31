function Grenade(){
    this.x = this.y = 0;
    this.timer = 2;
    this.rotation = 0;

    this.throw = function(angle, force){
        this.vX = cos(angle) * force;
        this.vY = sin(angle) * force;
    };

    this.cycle = function(e){
        var before = {
            x: this.x,
            y: this.y
        };

        if(!this.stuck || this.stuck.destroyed){
            this.stuck = null;

            this.vY += e * GRAVITY * 0.5;

            this.x += this.vX * e;
            this.y += this.vY * e;

            this.rotation += PI * 4 * e;

            var after = {
                x: this.x,
                y: this.y
            };

            if(!shittyMode){
                var trail = {
                    alpha: 1,
                    render: function(){
                        R.strokeStyle = 'rgba(255, 0, 0, ' + this.alpha + ')';
                        R.lineWidth = 8;
                        beginPath();
                        moveTo(before.x, before.y);
                        lineTo(after.x, after.y);
                        stroke();
                    }
                };
                G.renderables.push(trail);

                interp(trail, 'alpha', 1, 0, 0.3, 0, null, function(){
                    remove(G.renderables, trail);
                });
            }
        }

        this.timer -= e;
        if(this.timer <= 0){
            this.explode();
        }else{
            for(var i = 0 ; i < G.killables.length ; i++){
                if(G.killables[i] != P && dist(G.killables[i], this) < CHARACTER_WIDTH / 2){
                    this.explode();
                    break;
                }
            }
        }

        var tile = W.tileAt(this.x, this.y);
        if(tile && !this.stuck){
            this.vX *= GRENADE_BOUNCE_FACTOR;
            this.vY *= GRENADE_BOUNCE_FACTOR;

            var iterations = 0,
                adjustments;
            do{
                adjustments = tile.pushAway(this, GRENADE_RADIUS_2, GRENADE_RADIUS_2);

                if(adjustments & UP){
                    this.vY = -abs(this.vY);
                }
                if(adjustments & DOWN){
                    this.vY = abs(this.vY);
                }
                if(adjustments & LEFT){
                    this.vX = -abs(this.vX);
                }
                if(adjustments & RIGHT){
                    this.vX = abs(this.vX);
                }

                if(max(abs(this.vX), abs(this.vY)) < 150){
                    this.stuck = tile;
                    this.vX = this.vY = 0;
                }else{
                    // Particle when bouncing
                    if(adjustments && !shittyMode){
                        for(var i = 0 ; i < 2 ; i++){
                            var x = this.x + rand(-10, 10),
                                y = this.y + rand(-10, 10),
                                d = rand(0.2, 0.5);
                            particle(4, '#fff', [
                                ['x', x, x, d],
                                ['y', y, y - rand(50, 100), d],
                                ['s', 15, 0, d]
                            ]);
                        }
                    }
                }
            }while(adjustments && iterations++ < 5);
        }
    };

    this.explode = function(){
        if(this.exploded){
            return;
        }

        this.exploded = true;

        [
            [this.x - TILE_SIZE, this.y + TILE_SIZE],
            [this.x, this.y + TILE_SIZE],
            [this.x + TILE_SIZE, this.y + TILE_SIZE],
            [this.x - TILE_SIZE, this.y],
            [this.x, this.y],
            [this.x + TILE_SIZE, this.y],
            [this.x - TILE_SIZE, this.y - TILE_SIZE],
            [this.x, this.y - TILE_SIZE],
            [this.x + TILE_SIZE, this.y - TILE_SIZE]
        ].forEach(function(p){
            W.destroyTileAt(p[0], p[1]);
        });

        for(var i = 0 ; i < 40 ; i++){
            var d = rand(0.5, 1.5),
                x = rand(-TILE_SIZE, TILE_SIZE) + this.x,
                y = rand(-TILE_SIZE, TILE_SIZE) + this.y;

            particle(4, pick([
                'red',
                'orange',
                'yellow'
            ]), [
                ['x', x, x + 10, d, 0, oscillate],
                ['y', y, y - rand(100, 300), d, 0],
                ['s', rand(30, 50), 0, d]
            ]);
        }

        for(i in G.killables){
            if(dist(this, G.killables[i]) < TILE_SIZE * 2){
                G.killables[i].hurt(this, 3);
            }
        }


        var m = this;
        T(function(){
            remove(G.cyclables, m);
            remove(G.renderables, m);
        }, 0);

        T(function(){
            if(V.targetted == m){
                V.targetted = null;
            }
        }, 1000);

        explosionSound.play();
    };

    this.render = function(){
        save();
        translate(this.x, this.y);
        rotate(this.rotation);
        R.fillStyle = 'red';
        fillRect(-GRENADE_RADIUS, -GRENADE_RADIUS, GRENADE_RADIUS_2, GRENADE_RADIUS_2);
        restore();
    };
}
