/* Adapted from https://gist.github.com/dipo1/5ef88a14821202da0b33d84c5bfacc58#file-char_combinations-js */
function* charCombinations(chars, length) {
    chars = typeof chars === 'string' ? chars : '';
    word = (chars[0] || '').repeat(length);
    yield word;
    for (j = 1; j < Math.pow(chars.length, length); j++) {
        for (k = 0; k < length; k++) {
            if (!(j % Math.pow(chars.length, k))) {
                let charIndex = chars.indexOf(word[k]) + 1;
                char = chars[charIndex < chars.length ? charIndex : 0];
                word = word.substr(0, k) + char + word.substr(k + char.length);
            }
        }
        yield word.split('').reverse().join('');
    }
}
function* nameGenerator() {
    for (var i = 0;; i++) {
        for (var name of charCombinations('exc', i)) {
            if (name.length===0) continue;
            yield name;
        }
    }
}


function pyfuckup(program, runInParent, useDijkstra) {
    const gen = nameGenerator()
    getname = () => gen.next().value
    let names = {
        1: getname(),
        0: getname(),
        3: getname(),
        43: getname(),
        'joiner': getname(),
        'program': getname()
    }
    const execs = [];
    compile = () => execs.map(ex => "exec(" + ex + ")").join("==");
    add_exec = (x) => execs.push(x);

    add_exec(`'${names[0]}=%x'%('e'=='')`);
    add_exec(`'${names[1]}=%x'%(''=='')`);

    // Create 3 using '0b11'
    add_exec(`'${names[3]}=%x%%x'%${names[1]}%${names[1]}`);
    add_exec(`'${names[3]}=%x%%x%%%%x%%%%%%%%x'%${names[0]}%${names[3]}%${names[1]}%${names[1]}`);

    // Create 43 utilizing int(hex(int(hex(103))))
    add_exec(`'${names[43]}=%x%%x%%%%x'%${names[1]}%${names[0]}%${names[3]}`);
    add_exec(`'${names[43]}=%x'%${names[43]}`);
    add_exec(`'${names[43]}=%x'%${names[43]}`);
    names["+"] = names[43]; // For clarity

    const charset = [...new Set(program)];
    if (!runInParent)
        charset.push("{","}",",");
    const charcodes = charset.map((ch)=>ch.charCodeAt(0));

    if (useDijkstra) {
        names[45] = getname();
        add_exec(`'${names[45]}=${names[43]}%c${names[1]}%%c${names[1]}'%${names['+']}%${names['+']}`);
        const path = dijkstra(charcodes);
        path.forEach((op)=>{
            if (op.n in names) return;
            let name = getname();
            let [a,b] = op.args;
            add_exec(`'${name}=${names[a]}%c${names[b]}'%${names[op.op.symbol.charCodeAt(0)]}`);
            names[op.n]=name;
        });
    } else {
        // Construct numbers using powers of 2
        names = {
            ...names,
            2: getname(),
            4: getname(),
            8: getname(),
            16: getname(),
            32: getname(),
            64: getname()
        }
        // Construct all powers of 2 up to 2**6
        for (var p = 1; p <= 6; p++) {
            add_exec(`'${names[Math.pow(2, p)]}=${names[Math.pow(2, p - 1)]}%c${names[Math.pow(2, p - 1)]}'%${names['+']}`);
        }
        function storeNumber(num, name) {
            // For the moment we limit ourselves to ASCII, this can be expanded later
            if (128 <= num || num <= 0)
                throw 'Number not in range';
            pows = [];
            for (var i = 0; i <= 6; i++) {
                if ((num >> i) & 1);
                    pows.push(Math.pow(2, i));
            }
            add_exec(`'${name}=${names[pows.pop()]}'`);
            while (pows.length)
                add_exec(`'${name}%c=${names[pows.pop()]}'%${names[43]}`);
        }
        for (ch of charset) {
            let chcode = ch.charCodeAt(0);
            if (chcode in names) continue;
            let name = getname();
            storeNumber(chcode, name);
            names[chcode] = name;
        }
    }

    add_exec(`'''${names["joiner"]}=('%c%%c%%%%c%%%%%%%%c')'''`);

    add_exec(`'''${names["program"]}=('')'''`)
    let chars = program.split("");
    while (chars.length) {
        if (chars.length >= 4) {
            // 4 characters at a time for efficiency
            const [a, b, c, d] = chars.slice(0, 4).map((ch) => names[ch.charCodeAt(0)]);
            chars = chars.slice(4);
            add_exec(`'${names["program"]}%c=${names["joiner"]}%%${a}%%${b}%%${c}%%${d}'%${names["+"]}`);
        } else {
            add_exec(`'''${names["program"]}%c=('%%c')'''%${names["+"]}%${names[chars.shift().charCodeAt(0)]}`);
        }
    }
    if (runInParent) {
        add_exec(names['program']);
    } else {
        [c, br, bl] = [
            names[",".charCodeAt(0)],
            names["{".charCodeAt(0)],
            names["}".charCodeAt(0)]
        ]
        add_exec(`'exec(${names["program"]}%c%%c%%%%c)'%${c}%${br}%${bl}`);
    }
    return compile();
}