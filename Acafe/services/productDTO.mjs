 function productDTO(product){
    const ingridients = JSON.parse(product['ingridients_json'] !== null ? `[${product['ingridients_json']}]`:product['ingridients_json'] )
    const variations = JSON.parse(product['variations_json'])
    const {
        product_name,
        description,
        URL,
        ProductType_name,
        idCombo
    } = product

    return {
        productName: product_name,
        idCombo,
        description,
        url: URL,
        productType: ProductType_name,
        ingridients,
        variations,
       
    }
}

function productDTOArray(menu){
    return menu.map(product => productDTO(product))
}

export {
    productDTOArray,
    productDTO}