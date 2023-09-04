export const promocodes = {
    "TEST": {
        sql: `
        UPDATE Cart 
        set Cart.product_price=Cart.product_price-(Cart.product_price*0.1)
        WHERE (
            SELECT !COUNT(*) count FROM Users_promocode
            WHERE id_user=:userId
        ) 	and id_users=:userId and now()<'2024-02-05'
        `,
        onErrorMessage: "Сумма вашего заказа должна быть более 500 рублей для активации промокода или промокод уже активирован",
    },

}