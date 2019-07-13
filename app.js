
var learn = getDataLearn();
var lessons = getDataLesson();
var oldList = [];
var max = learn.length;
var colourMap = {prep:"info",conj:"secondary",adj:"primary",adv:"danger",verb:"warning",noun:"success",other:"dark"};
var enableLog = false;
var numberWord = 15;
var isVocaCkb = false;
var isStcCkb = true;
var isRandomCkb = true;
var isAnswerCkb = false;

$(function () {
    genTableContent();
    setChecked("isVocaCkb",isVocaCkb);
    setChecked("isStcCkb",isStcCkb);
    setChecked("isRandomCkb",isRandomCkb);
    setChecked("isAnswerCkb",isAnswerCkb);
    getWord();
});

function allLesson() {
    setChecked("isRandomCkb",true);
    getWord();
}
function getVocaCkb(){
    return getCheckBox("isVocaCkb");
}

function getStcCkb(){
    return getCheckBox("isStcCkb");
}

function getRandomCkb(){
    return getCheckBox("isRandomCkb");
}

function getAnswerCkb(){
    return getCheckBox("isAnswerCkb");
}

function getCheckBox(id){
    return $("#"+id).is(":checked");
}

function onChangeCheckBox(id) {
    window[id] = $("#"+id).is(":checked");
}

function setChecked(id,value) {
    $("#"+id).prop("checked", value);
    window[id] = value;
}

function genTableContent(){
    var tableContent = $('#tableContent');

    for(var code in lessons){
        tableContent.append(getHtmlTableContentTag(code,lessons[code]));
    }
}

function getHtmlTableContentTag(code,name){
    var query = "'less="+code+"'";
    return '<button type="button" class="btn btn-primary mb-1 ml-1" onclick="getWord('+query+')">'+name+'</button>'
}

function getLearnProperty(data,prop,less){
    return prop === "less" ? less[data[prop]] : data[prop];
}

function genTag(data,less){
    logD("genTag","data",data);
    switch(data.type){
        case "stc": return genSentence(data,less);
        case "voca": return genVoca(data,less)
    }
}

function genVoca(data,less){
    var format = {primary:["en"],title:["less"],content:["vi","note"],small:["kind2","less"]};
    data.kind2=data.kind2.toUpperCase();
    var dataFormat = formatData(format,data,less);
    return getHtmlVocaTag(dataFormat);
}

function genSentence(data,less){
    var format = {primary:["vi"],title:["less"],content:["en"],small:["less"]};
    if(getAnswerCkb()){
        format.small.push("en");
    }

    var dataFormat = formatData(format,data,less);
    return getHtmlVocaTag(dataFormat);
}

function formatData(format,data,less){
    logD("formatData","format",format);
    var vocaKind = colourMap.hasOwnProperty(data["kind1"]) ? data["kind1"] : "other";
    var colourValues = Object.values(colourMap);
    var colour = data["type"] === "stc" ? colourValues[getRandom(colourValues.length)] : colourMap[vocaKind];
    var dataTemp = {colour:colour,title:'',content:'',primary:'',small:''};

    var join;
    for (var property in format) {
        join = [];
        join.push(getLearnProperty(data,format[property][0],less));
        for (var i = 1; i < format[property].length; i++){
            var dt = getLearnProperty(data,format[property][i],less);
            if (dt != null && dt.length > 0){
                join.push(getLearnProperty(data,format[property][i],less));
            }
        }
        dataTemp[property] = join;
    }

    logD("formatData","dataTemp",dataTemp);
    return dataTemp;
}

var separate = " - ";
function getHtmlVocaTag(data){
    return '<div class="col-12 alert alert-'+data.colour+'" data-toggle="popover" data-trigger="hover" title="'+data.title.join(separate)+'" data-placement="bottom" data-content="'+data.content.join(separate)+'"><lead>'+data.primary.join(separate)+'</lead>' + gentHtmlSmall(data.small) + '</div>'
}

function gentHtmlSmall(data) {
    var html = "";
    for(var i in data){
        if(data[i] !== ""){
            html += "<br/><small>"+data[i]+"</small>";
        }
    }
    return html;
}

function defaultIfError(value,vDefault) {
    return value === undefined || value === "" ? vDefault : value;
}


function getWord(queries){
    var fullQuery;
    var queryWordType = ";type=";
    if(getStcCkb()){
        queryWordType += ",stc";
    }
    if(getVocaCkb()){
        queryWordType += ",voca";
    }
    fullQuery = defaultIfError(queries,"") + queryWordType;

    var vocaMain = $('#main');
    vocaMain.empty();

    var word;
    var number = numberWord;
    var isRandomWord = getRandomCkb();
    for(var i = 0; i < max; i++){
        logD("======="+i+"=======");
        if(isRandomWord){
            word = learn[getRandomNotCoincide(oldList,max,maxHandle)];
        } else {
            word = learn[i];
        }
        if (filter(word,fullQuery)) {
            vocaMain.append(genTag(word, lessons));
            if (isRandomWord && --number === 0) break;
        }
    }

    $('[data-toggle="popover"]').popover();
    logD("==============================================================");
}

function maxHandle(oldList,max){
    if(oldList.length>=max) {
        logD("maxHandle","max",max);
        logD("maxHandle","oldList.length",oldList.length);
        logD("maxHandle","oldList",oldList);
        emptyArr(oldList);
    }
}

// function logE(){
//     if(enableLog){
//         console.error(getGenMessLog(arguments));
//     }
// }
//
// function logW(){
//     if(enableLog){
//         console.warn(getGenMessLog(arguments));
//     }
// }

function logD(){
    if(enableLog){
        console.debug(getGenMessLog(arguments));
    }
}

// function log(){
//     if(enableLog){
//         console.log(getGenMessLog(arguments));
//     }
// }

function getGenMessLog(messArr) {
    var message = messArr[0];
    for(var i = 1; i < messArr.length; i++){
        message += " : " + getObjectJson(messArr[i]);
    }
    return message;
}

function getObjectJson(data) {
    return data instanceof Object ? JSON.stringify(data) : data;
}

function emptyArr(arr){
    logD("emptyArr","arr.length",arr.length);
    while(arr.length>0){
        arr.pop();
    }
    logD("emptyArr","arr.length",arr.length)
}

function filter(data, query) {
    if (query === null) return true;

    var subQueries = query.split(";");
    var kv, arrValue;
    for (var i in subQueries) {
        if (subQueries[i] !== "") {
            kv = subQueries[i].split("=");
            arrValue = ("," + kv[1]).split(",");
            if (!arrValue.includes(data[kv[0]])) {
                return false;
            }
        }
    }

    return true;
}

function getRandomNotCoincide(oldList,max,maxHandle){
    logD("getRandomNotCoincide","oldList.length",oldList.length);
    if(maxHandle !== undefined){
        var handledValue = maxHandle(oldList,max);
        if(!isNaN(handledValue)) return handledValue;
    }else {
        if(oldList.length>=max)emptyArr(oldList);
    }

    var randomNumber;
    for(var i = 0; i < max; i++){
        randomNumber = getRandom(max);
        if(!oldList.includes(randomNumber)){
            oldList.push(randomNumber);
            logD("getRandomNotCoincide","randomNumber",randomNumber);
            return randomNumber;
        }
    }
    logD("getRandomNotCoincide","return-default",1);
    return 1;
}

//get a random number, which is smaller than max
function getRandom(max){
    return Math.floor((Math.random() * max));
}

// function httpGet(url) {
//     var req = new XMLHttpRequest();
//
//     req.addEventListener('load', onLoad);
//     req.addEventListener('error', onFail);
//     req.addEventListener('abort', onFail);
//
//     req.open('GET', url);
//     req.send();
//
//     function onLoad(event) {
//         if (req.status >= 400) {
//             onFail(event);
//         } else {
//             learn = JSON.parse(this.responseText);
//         }
//     }
//
//     function onFail(event) {
//         callback(new Error('...'));
//     }
// }