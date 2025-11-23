export const MarketAPI = {
    fetchCatalog: async () => {
        const res = await fetch('../../data/products.json');
        const data = await res.json();
        return data;
    },

    createOrder: (orderPayload) => {
        const id = 'ORD-' + Date.now();
        const total = orderPayload.items.reduce((s, i) => s + i.qty * i.price, 0);

        return {
            id,
            items: orderPayload.items,
            total,
            customer: orderPayload.customer,
            createdAt: new Date().toLocaleString()
        };
    }
};
