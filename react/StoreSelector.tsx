import React from 'react'
import { OrderFormProvider } from 'vtex.order-manager/OrderForm'
import { OrderQueueProvider } from 'vtex.order-manager/OrderQueue'
import { OrderShippingProvider } from 'vtex.order-shipping/OrderShipping'
import StoreSelector from './components/StoreSelector'


const StoreSelectorWraper = (props: any) => {
    const { storesArr, country, googleMapskey } = props

    console.log(props);
    
    return (
        <OrderQueueProvider>
            <OrderFormProvider>
                <OrderShippingProvider>
                    <StoreSelector storesArr={storesArr} country={country} googleMapskey={googleMapskey}/>
                </OrderShippingProvider>
            </OrderFormProvider>
        </OrderQueueProvider>
    )
}

StoreSelectorWraper.schema = {
    title: 'Store Selector'
}

export default StoreSelectorWraper