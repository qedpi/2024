new Vue({
    el: "#app",
    data: {
        message: 'hello',
        boxes: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]],
        box_rows: 4,
        box_cols: 4,
        push_dirs: {37: [0, 1], 38: [1, 0], 39: [0, -1], 40: [-1, 0]},
        rint_range: [0, 2],
        ops: "+-*/"
    },
    methods: {
        rand_range(a, b){
            return Math.floor(Math.random() * (b - a + 1)) + a
        },
        randint(){
            return this.rand_range(...this.rint_range)
        },
        randop(){
            return this.ops[this.rand_range(0, 3)]
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
        genk(k){
            for (let i = 0; i < k; i ++){
                let empties = this.get_empty_cells()
                console.log(...empties)
                if (empties.length < 1){
                    break
                }
                let [r, c] = empties[this.rand_range(0, empties.length - 1)]
                console.log(r, c)
                this.boxes[r][c] = this.gen_something()
            }
        },
        gen_maybe(){
            let val = null
            const hasvalue = Math.random()
            if (hasvalue < .2){
                val = this.gen_something()
            }
            return val
        },
        gen_something(){
            let val = null
            const select = Math.random()
            if (select < .4){
                val = this.randop()
            } else {
                val = this.randint()
            }
            return val
        },
        gen_box_vals(){
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
            const xlast = x[x.length - 1]
            const yfirst = y[0]
            return this.ops.includes(xlast) !== this.ops.includes(yfirst)
        }
        ,
        box_push(dir){
            this.play_sound("push_effect")
            const [dx, dy] = dir
            /*
            for (let r = 0; r < this.box_rows; r ++){
                for (let c = 0; c < this.box_cols; c ++){
                    let [yf, xf] = [r + dx, c + dy]
                    let in_bounds = 0 <= xf && xf < this.box_cols && 0 <= yf && yf < this.box_rows
                    if (in_bounds){
                        // this.boxes[r][c] = -1
                        let [from, target] = [this.boxes[yf][xf], this.boxes[r][c]]
                        this.boxes[r][c] += this.combinable(target, from)
                    }
                }
            } */
            this.genk(1)
            this.boxes.push([])
            this.boxes.pop()
            /*
            let box_after = [] // this.boxes[r][c]

            this.boxes.forEach((row, i) => {
                // console.log(row)
                let row_after = []
                row.forEach((box, j) => {
                    let [yf, xf] = [i + dx, j + dy]
                    let [yr, xr] = [i - dx, j - dy]
                    // console.log(yr, xr, i, j)
                    // If within bounds, shift
                    let carry = ""
                    let in_bounds = 0 <= xf && xf < this.box_cols && 0 <= yf && yf < this.box_rows
                    if (in_bounds && this.boxes[yf][xf] !== null){
                            carry += this.boxes[yf][xf]
                    } else {
                        // has no value
                        carry = null
                    }
                    if (!(0 <= xr && xr < this.box_cols && 0 <= yr && yr < this.box_rows) && this.boxes[i][j] !== null){  // end element, gets added to
                        carry += this.boxes[i][j]
                    }
                    row_after.push(carry)
                })
                box_after.push(row_after)
            })

            this.boxes = box_after
             */
        },
        play_sound(sound_id){
            // makes sure that sound effect plays from start even when it's still playing
            aud = document.getElementById(sound_id);
            aud.pause();
            aud.currentTime = 0;
            aud.play();
        },
    },
    mounted(){
        this.gen_box_vals()
        window.addEventListener('keyup', e => {
            // check for arrow keys
            if (Object.keys(this.push_dirs).includes(String(e.keyCode))){
                this.box_push(this.push_dirs[e.keyCode])
            }
        })
    },
})