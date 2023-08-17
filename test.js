
function get_random_num(min,max){
    min = Math.ceil(min)
    max = Math.ceil(max)
    return Math.floor(Math.random()*(max-min)+min)
}

console.log(get_random_num(1000,9999));