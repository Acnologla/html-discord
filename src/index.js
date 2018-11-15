var cheerio = require('cheerio')
var discord = require('discord.js')
var fs = require("fs")
var client = new discord.Client()
const conditions = ["if","var"]
async function main(path) {
    let html = await fs.readFileSync(path)
    var $ = cheerio.load(html)
    let events = $("client").first().children("events")
    client.login($("client").first().attr("token"), JSON.parse($("client").first().attr("op")))
    events.children().each(function (a, b) {
        var variable = $(this).attr("var")
        let _this = this;
        client.on(this.name.toString(), function (event) {
            $(_this).children().each(function (c, d) {
                if (conditions.includes(this.name)) {
                    if (eval(interpreter({ a: $(this).attr("condition") }, variable, event, true).a)) {
                        if ($(this).attr("action") == "return") return ;
                        recursive.bind(this)($, variable, event).then(async response2 => {
                            response2.forEach(response =>
                                run(response.name, $(response).attr(), event, variable))
                        })
                    }
                }
                else run(this.name, $(this).attr(), event, variable)
            })
        })
    })
}
async function recursive($, variable, event,localvar) {
    return new Promise(async (resolve, reject) => {
        let arr = []
        let _this = this;
        await $(this).children().each(async function (e, f) {
            if ($(_this).children().toArray().some(a => conditions.includes(a.name))) {
                if (conditions.includes(this.name)) {
                    if (eval(interpreter({ a: $(this).attr("condition") }, variable, event, true).a)) {
                        if ($(this).attr("action") == "return") return reject();
                        else {
                            let teste = await recursive.bind(this)($, variable, event,this.name == 'var' ?{varname:$(this).attr("varname"),content:$(this).attr("content")} : null )
                            for (c of teste)
                                await arr.push(c);
                            resolve(arr);
                        }
                    }
                }
                else{ 
                    if (localvar)$(this).attr("localvar",localvar.varname+" | "+localvar.content);;
                    arr.push(this)};
            }

            else {
                if (localvar)$(this).attr("localvar",localvar.varname+" | "+localvar.content);;
                arr.push(this);
                resolve(arr);
            }
        })
    })
}
function run(name, atributes, event, variable) {
    func[name](event, interpreter(atributes, variable, event))
}
let func = {
    reply: function (msg, { content }) {
        msg.reply(content)
    },
    log: function (event, { content }) {
        console.log(content);
    },
    exe: function (event, { exec,localvar }) {
        if (localvar){localvar = localvar.split(" | ");
        return eval(`${localvar[0]}\nlet ${localvar[1]} = ${localvar[2]};${exec}`)
    }
        eval(exec);
    },
    exevar: function (event, { exec, content, varname }) {
        eval(`let ${varname} = content\n;` + exec.replace(/%s/g, eval(content)))
    },
    var:function(){}
}
function interpreter(a, variable, event, isCondition) {
    Object.keys(a).forEach(b => {
        if (!a[b]) return a;
        if (!a[b].match(new RegExp(`${variable}.[a-zA-Z]+`))) return a;
        a[b].match(new RegExp(`${variable}.[a-zA-Z]+`)).map(c => {
            if (isCondition)
                a[b] = `var ${variable} = event;\n${a[b]}`
            else {
                if (b == 'exec') {
                    a[b] = `var ${variable} = event;${a[b]}`
                }
                else if (b=='localvar'){
                    a[b] = `var ${variable} = event; | ${a[b]}` 
                }
                else a[b] = a[b].replace(c, `${event[c.split(".")[1]]}`)
            }
        })
    })
    return a
}
module.exports = main;