function rand_range(a, b){
    return Math.floor(Math.random() * (b - a + 1)) + a
}
function range(a, b){
    let reversed = false;
    if (a > b){
        reversed = true;
        [a, b] = [b, a]
    }
    let ran = Array(b - a + 1).fill().map((x, i) => i + a);
    return reversed? ran.reverse() : ran;
}
function repeat(val, times){
    return Array(times).fill(val);
}

new Vue({
    el: "#app",
    data: {
        message: 'hello',
        boxes: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]],
        box_rows: 4,
        box_cols: 4,

        // left, up, right, down
        push_dirs: {37: [0, 1], 38: [1, 0], 39: [0, -1], 40: [-1, 0]},
        traverse_dirs: null,
        rint_range: [1, 10],
        ops: "+-*/"
    },
    methods: {
        randop(){
            return this.ops[rand_range(0, 3)]
        },
        is_op(cell){
            if (cell === null)
                return false
            else
                return this.ops.includes(cell.slice(-1))
        },
        get_empty_cells(){
            let empties = []
            for (let r = 0; r < this.box_rows; r ++){
                for (let c = 0; c < this.box_cols; c ++){
                    if (this.boxes[r][c] === null){
                        empties.push([r, c])
                    }
                }
            }
            return empties
        },
        game_over(){
            this.play_sound("game_over")
            alert('game over');
            this.gen_box_vals()
        },
        win_game(){
            this.play_sound("applause")
            alert("congrats, you've made 24!")
            this.gen_box_vals()
        },
        genk(k){
            let empties;
            for (let i = 0; i < k; i ++){
                empties = this.get_empty_cells()
                console.log(...empties)
                if (empties.length < 1){
                    break
                }
                let [r, c] = empties[rand_range(0, empties.length - 1)]
                console.log(r, c)
                this.boxes[r][c] = [this.gen_something()]
            }
            if (!empties.length){
                this.game_over()
            }
        },
        gen_maybe(){
            let val = null
            const hasvalue = Math.random()
            if (hasvalue < .2){
                val = [this.gen_something()]
            }
            return val
        },
        gen_something(){
            let val = null
            const select = Math.random()
            if (select < .5){
                val = this.randop()
            } else {
                val = rand_range(...this.rint_range)
            }
            return String(val)
        },
        gen_box_vals(){
            this.traverse_create();
            this.boxes.forEach((row, i) => {
                this.boxes.forEach((cell, j) => {
                    this.boxes[i][j] = this.gen_maybe()
                })
            })
            // so vue knows array has changed
            this.boxes.push([])
            this.boxes.pop()
            // console.log(...this.get_empty_cells())
        },
        combinable(x, y) {
            // if two boxes can be ocmbined into one
            const xlast = x[x.length - 1]
            const yfirst = y[0]
            if (this.ops.includes(xlast) !== this.ops.includes(yfirst)){
                if (!(this.ops.includes(x[0]) && x.length + y.length > 2)){
                    return true;
                }
            }
            return false;
        },
        traverse_create(){
            this.traverse_dirs = {37: [range(0, this.box_rows - 1), range(0, this.box_cols - 2)],
                38: [range(0, this.box_rows - 2), range(0, this.box_cols - 1)],
                39: [range(0, this.box_rows - 1), range(this.box_cols - 1, 1)],
                40: [range(this.box_rows - 1, 1), range(0, this.box_cols - 1)]}
        },
        box_push(dir, row_range, col_range){
            this.play_sound("push_effect")
            const [dy, dx] = dir
            for (let r of row_range){
                for (let c of col_range){
                    // if cur empty, shift over incoming, otherwise, combine if possible
                    const [yf, xf] = [r + dy, c + dx];
                    let [cur, target] = [this.boxes[r][c], this.boxes[yf][xf]];
                    // cur empty, next not empty
                    // console.log(r, c, cur, target)
                    if (cur === null && target !== null){
                        this.boxes[r][c] = target;
                        this.boxes[yf][xf] = null;
                    } else if (cur !== null && target !== null){
                        if (dx === -1 || dy === -1){
                            [cur, target] = [target, cur]
                        }
                        let res = cur.concat(target)
                        if (this.combinable(cur, target)){
                            if (!this.ops.includes(res[0]) && res.length >= 3){ // can simplify expression
                                res = [String(eval(res.slice(0, 3).join('')))].concat(res.slice(3))
                            }
                            if (res[0] === '24'){
                                this.win_game()
                            }
                            this.boxes[r][c] = res;
                            this.boxes[yf][xf] = null;
                        }
                    }
                }
            }

            this.genk(1)

            this.boxes.push([])
            this.boxes.pop()



        },
        play_sound(sound_id){
            // makes sure that sound effect plays from start even when it's still playing
            aud = document.getElementById(sound_id);
            aud.pause();
            aud.currentTime = 0;
            aud.play();
        },
    },

    filters: {
        combine(ar){
            console.log('ar is', ar)
            return ar === null? null : ar.join('')
        }
    },
    mounted(){
        this.gen_box_vals()
        window.addEventListener('keyup', e => {
            // check for arrow keys
            if (Object.keys(this.push_dirs).includes(String(e.keyCode))){
                this.box_push(this.push_dirs[e.keyCode], ...this.traverse_dirs[e.keyCode])
            }
        })
    },
})