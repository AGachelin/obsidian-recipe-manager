function viewIngredients(ingredients){
    let view = "";
    let key;
    for(key in ingredients){
        if(key !=="last_id"){
            if(ingredients[key].amount){
                view+=`\`VIEW[convertBack({ingredients["`+key+`"].unit}, {ingredients["`+key+`"].amount}, {ingredients["`+key+`"].name})]\``+' ';
                if (ingredients[key]["unit"] === ""){
                    view+=`\`VIEW[{ingredients["`+key+`"].unit}]\``+' ';
                    view+=`\`VIEW[{ingredients["`+key+`"].name}]\``;
                }
                else{
                    view+='de '
                    view+=`\`VIEW[{ingredients["`+key+`"].name}]\``;
                }
            }
            else{
                view+=`\`VIEW[{ingredients["`+key+`"].name}]\``; 
            }
            view+='\n';
        }
    }
    return view;
}
export default viewIngredients;