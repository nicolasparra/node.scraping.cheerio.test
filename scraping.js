const request = require('request-promise');
const cheerio = require('cheerio');

const fs = require('fs-extra');
const writeStream = fs.createWriteStream('quotes.csv');

const url = 'http://quotes.toscrape.com/'
// const url = 'https://www.ufro.cl/'

async function init(req,res) {
    try {
        const $ = await request({
            uri: url,
            transform: body => cheerio.load(body)
        });

        const websiteTitle = $('title');
        console.log('Title: ', websiteTitle.html());

        const webSiteHeading = $('h1')
        console.log('Heading: ', webSiteHeading.text().trim());

        const quote = $('.quote').find('a');
        console.log(quote.html());

        const third_quote = $('.quote').next().next();
        // console.log(third_quote.html())

        // Parent
        const containerClass = $('.row.header-box');
        // console.log(containerClass.parent().html())

        // $('.quote span.text').each((i, el) => {
        //     const quote_text = $(el).text();
        //     const quote = quote_text.replace(/(^\“|\”$)/g, "");
        // })        

        writeStream.write('Quote|Author|Tags\n');
        const tags = [];
        $('.quote').each((i, el) => {
            const text = $(el).find('span.text').text().replace(/(^\“|\”$)/g, "");
            const author = $(el).find('span small.author').text();
            const tag = $(el).find('.tags a').html();
            tags.push(tag);
            // console.log(text, author, tags.join(','))
            writeStream.write(`${text}|${author}|${tags}\n`);
            // console.log(i, text, author)
        })

        console.log('Done.');
        // $('.quote .tags a').each((i, el) => {
        //     // console.log($(el).html())
        //     const text = $(el).text();
        //     const link = $(el).attr('href');
        //     console.log(text, link)
        // });

    } catch (e) {
        console.log(e);
    }
}

async function getHTML(req,res){
    const response = await request(url);
    res.send(response);
}

async function getProcessHEAD(req,res){
    const $ = await request({
        uri: url,
        transform: body => cheerio.load(body)
    });
    const websiteHead = $('head');
    const tags = await getTotalTags(websiteHead);
    const content = await getContentTags(tags);
    res.send(content);
}

async function getProcessBODY(req,res){
    const $ = await request({
        uri: url,
        transform: body => cheerio.load(body)
    });
    const websiteHead = $('body');
    const tags = await getTotalTags(websiteHead);
    const content = await getContentTags(tags);
    res.send(content);
}

async function getContentTags(arr){
    const $ = await request({
        uri: url,
        transform: body => cheerio.load(body)
    });
    let allContent=[];
    await asyncForEach(arr, async (element,index)=>{
        let content =$(`${element}`);
        let aux= content.html();
        if(aux){
            allContent.push({ [`${element}`]: aux });
        }
    })
    return allContent;
}

async function getTotalTags(sectionHtml){
    const content=sectionHtml.html().split("\n");
    let arr=content.filter(Boolean);
    let tags=[];
    await asyncForEach(arr, async (element,index)=>{
        let tag= await getTag(element);
        tags.push(tag);
    })
    return tags;
}

async function getTag(str){
    const clean=str.trim();
    const arrayTotal= clean.split('');
    const startTag=arrayTotal.indexOf('<');
    const endTag=arrayTotal.indexOf('>');
    const end=arrayTotal.indexOf(' ');
    let arrayTag;
    if(endTag<end){
        arrayTag=arrayTotal.slice(startTag+1,endTag);
    }else{
        arrayTag=arrayTotal.slice(startTag+1,end);
    }
    return arrayTag.toString().replace(/,/g, "");
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}


module.exports={
    init,
    getHTML,
    getProcessHEAD,
    getProcessBODY
}