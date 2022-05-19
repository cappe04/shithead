// let a = -0.02;
// let h = 5;
// let k = 0.5;

// let diff = 0.1;
// let multi = 1.6;

// function aligncards(){
//     let cards = document.getElementsByClassName("card");
//     let count = cards.length;
//     Array.from(cards).forEach(card => new function(){
//         let i = Array.from(cards).indexOf(card);
//         let width = parseInt($(card).css('width').replace("px", ""));
//         let left = width * i / 2;

//         let totalwidth = count * (width / 2) + width / 2;
//         let handwidth = $("#hand").css("width").replace("px", "");

//         if(totalwidth > handwidth){
//             //shift the cards to fit with minimal margin leftover
//             let overflow = totalwidth - handwidth;
//             let shift = (overflow / (count - 1));
//             left -= shift * i;
//             totalwidth = handwidth;
//         }
//         let leftdif = (handwidth - totalwidth) / 2;
        
//         left += leftdif;
//         $(card).css('left', left + 'px');

//         let center = left + width / 2;
//         let xpos = center / handwidth * 10;
//         let ypos = getypos(xpos);
//         let rot = getrotation(xpos);

//         let bottom = (ypos / k) * $("#hand").css("height").replace("px", "") / 4;

//         $(card).css("bottom", bottom + "px");
//         $(card).css("transform", "rotate(" + rot + "deg)");
//     });
// }

// function addcards(count){
//     let delay = 300;
//     $("#hand").append(getrandomcard());
//     aligncards();
//     count --;
//     let x = setInterval(() => {
//         if(count < 1){
//             clearInterval(x);
//         }
//         else{
//             $("#hand").append(cardmarkup);
//             aligncards();
//             count --;
//         }
//     }, delay);
// }



// function getrotation(xpos){
//     let ypos = getypos(xpos);
//     if(xpos < h){
//         //left of the vertex
//         let newx = xpos + diff;
//         let newy = getypos(newx);

//         let adjacent = newx - xpos;
//         let opposite = newy - ypos;
//         let angle = Math.atan(opposite / adjacent);
//         angle *= 180;
//         angle /= Math.PI;
//         angle = 0 - angle;
//         return angle * multi;
//     }
//     else if(xpos > h){
//         //right of the vertex
//         let newx = xpos - diff;
//         let newy = getypos(newx);

//         let adjacent = newx - xpos;
//         let opposite = newy - ypos;
//         let angle = Math.atan(opposite / adjacent);
//         angle *= 180;
//         angle /= Math.PI;
//         angle = 0 - angle;
//         return angle * multi;
//     }
//     else{
//         //on the vertex
//         return 0;
//     }
// }

// function getypos(xpos){
//     let ypos = a * Math.pow((xpos - h), 2) + k;
//     return ypos;
// }