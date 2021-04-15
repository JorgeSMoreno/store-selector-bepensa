/* eslint-disable no-console */
import React, { useState } from 'react'
import { Modal, ButtonWithIcon, Dropdown, RadioGroup } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { calcCrow } from '../utils/crow'
import { useUpdateSession, useFullSession } from 'vtex.session-client'
import { useOrderShipping } from 'vtex.order-shipping/OrderShipping'

import logo from '../img/logo.svg'
import location from '../img/location.svg'

import { CRI } from '../utils/postalCodes/CRI'

import '../styles/global.css'

const CSS_HANDLES = [
  'button',
  'modal',
  'modalWraper',
  'openButton'
] as const

const StoreSelector = (props: any) => {
  const { storesArr, country, googleMapskey } = props
  const handles = useCssHandles(CSS_HANDLES)
  const { insertAddress } = useOrderShipping()
  const [open, setOpen] = useState(false)
  const [valueLv1, setValueLv1] = useState<any>()
  const [valueLv2, setValueLv2] = useState<any>()
  const [valueLv3, setValueLv3] = useState<any>()
  const [optionsLv3, setOptionsLv3] = useState<any>()
  const [optionsLv2, setOptionsLv2] = useState<any>()
  const [state, setState] = useState('active')
  const [stores, setStores] = useState<any>()
  const [radios, setRadios] = useState<any>()
  const [openOptions, setOpenOptions] = useState<any>(false)
  const [isLoading, setIsLoading] = useState(false)
  const updateSession = useUpdateSession()

  const { loading, data } = useFullSession({
    variables: {
      items: ['public.selectedStore'],
    },
  })

  if (!storesArr || loading) return <div className='mw5'></div>

  const selectedStore = data?.session?.namespaces?.public?.selectedStore?.value

  const handleOpenModal = () => {
    setOpen(() => true)
  }

  const handleCloseModal = () => {
    setOpen(() => false)
  }

  const handleChangeLv1 = (values: string) => {
    if (!values) {
      setValueLv1(() => null)
      setValueLv2(() => null)
      setValueLv3(() => null)
      setStores(() => null)
      setOpenOptions(() => false)
      setOptionsLv2(() => [])
      setOptionsLv3(() => [])
      return
    }

    setValueLv1(() => values)
    setValueLv2(() => null)
    setValueLv3(() => null)
    setStores(() => null)
    setOpenOptions(() => false)
    setOptionsLv2(() => Object.keys(CRI()[values]).map(i => ({ value: i, label: i })))
    setOptionsLv3(() => [])
  }

  const handleChangeLv2 = (values: string) => {
    if (!values) {
      setValueLv2(() => null)
      setValueLv3(() => null)
      setOptionsLv3(() => [])
      setStores(() => null)
      setOpenOptions(() => false)
      return
    }

    setValueLv2(() => values)
    setValueLv3(() => null)
    setStores(() => null)
    setOpenOptions(() => false)
    setOptionsLv3(() => Object.keys(CRI()[valueLv1][values]).map(i => ({ value: i, label: i })))
  }

  const handleChangeLv3 = (values: string) => {
    if (!values) {
      setValueLv3(() => null)
      setStores(() => null)
      setOpenOptions(() => false)
      return
    }

    setValueLv3(() => values)
    setStores(() => null)
    setOpenOptions(() => false)
  }

  const handleButton = () => {
    // const postalCode = CRI()[valueLv1][valueLv2][valueLv3].postalCode
    const location = { lng: CRI()[valueLv1][valueLv2][valueLv3].location.lng, lat: CRI()[valueLv1][valueLv2][valueLv3].location.lat }

    const iStores = storesArr.map((i: { location: { lng: number; lat: number } }) => ({ ...i, distance: parseFloat(calcCrow(i.location.lng, i.location.lat, location.lng, location.lat).toFixed(2)) }))
      .filter((i: { distance: number }) => i.distance < 10)
      .sort((a: { distance: number }, b: { distance: number }) => {
        return a.distance - b.distance;
      })

    const radios = iStores.map((i: { name: any; distance: string; provincia: any; canton: any; distrito: any; address: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined }, index: number) =>
    ({
      value: index.toString(),
      label: <div>
        <div className='store-title'>
          {`${i.name} `}
          <span className='f6 fw1'>
            ({index == 0 ? 'Mejor Opción' : i.distance + ' km'})
          </span>
        </div>
        <div className='c-gray elipsis'>
          {`${i.provincia}, ${i.canton}, ${i.distrito} `}
        </div>
        <div className='c-gray elipsis'>
          {i.address}
        </div>
      </div>
    })
    )

    setStores(iStores)
    setRadios(radios)

    setOpenOptions(true)

  }

  const handleButton2 = () => {
    setIsLoading(true)

    insertAddress({
      addressId: new Date().getTime(),
      addressType: 'residential',
      city: stores[state].canton,
      country: country,
      state: stores[state].provincia,
      // street: '',
      postalCode: stores[state].postalCode,
      neighborhood: stores[state].distrito,
      geoCoordinates: [stores[state].location.lng, stores[state].location.lat],
      // complement: '',
      // number: '',
      // receiverName: '',
      // reference: '',
      // addressQuery: '',
    })

    updateSession({
      variables: {
        fields: {
          country: country,
          postalCode: stores[state].postalCode,
          geoCoordinates: `${stores[state].location.lng}, ${stores[state].location.lat}`,
          selectedStore: stores[state]
        },
      },
    })
  }

  return (
    <React.Fragment>
      {selectedStore ?
        <div className={`${handles.openButton} `}>
          <ButtonWithIcon variation="tertiary" icon={<img src={location} />} onClick={() => handleOpenModal()}>
            <div className='tl'>{selectedStore.name}</div>
            {/* <div className='tl mw5 fw4 f7 elipsis'>{selectedStore.address}</div> */}
          </ButtonWithIcon>
        </div>
        :
        <div className={`${handles.openButton} `}>
          <ButtonWithIcon variation='tertiary' icon={<img src={location} />} onClick={() => handleOpenModal()}>Selecciona tu tienda</ButtonWithIcon>
        </div>
      }
      <div className={`${handles.modalWraper} `}>
        <Modal
          closeOnEsc={true}
          responsiveFullScreen={true}
          isOpen={open}
          title={
            <div>
              <div>
                <img src={logo} />
              </div>
              <div>
                {selectedStore ? null : <span className={'f5'}>Selecciona la tienda de tu preferencia</span>}
              </div>
            </div>}
          bottomBar={
            <div className="nowrap w-100">
              {!openOptions ? <span className={`mr4 ${handles.button} `}>
                <ButtonWithIcon variation="primary" disabled={!(valueLv1 && valueLv2 && valueLv3)} onClick={() => handleButton()}>
                  Buscar tienda
                </ButtonWithIcon>
              </span>
                :
                <span className={`mr4 ${handles.button} `}>
                  <ButtonWithIcon variation="primary" isLoading={isLoading} disabled={!(valueLv1 && valueLv2 && valueLv3)} onClick={() => handleButton2()}>
                    Aceptar
                </ButtonWithIcon>
                </span>}
            </div>
          }
          onClose={() => handleCloseModal()}>
          {selectedStore ?
            <div>
              <div className='store-title'>
                {`${selectedStore.name}`}
              </div>
              <div className='c-gray elipsis'>
                {`${selectedStore.provincia}, ${selectedStore.canton}, ${selectedStore.distrito} `}
              </div>
              <div className='c-gray elipsis'>
                {selectedStore.address}
              </div>
              <img className='map' src={`https://maps.googleapis.com/maps/api/staticmap?zoom=17&size=600x300&markers=${selectedStore.location.lat},${selectedStore.location.lng}&key=${googleMapskey}`} />
            </div>
            : null}
          <div className={`w - 100 ${handles.modal} `}>
            <div className="w-100 mv6">
              <Dropdown
                disabled={isLoading}
                value={valueLv1}
                placeholder="Provincia"
                options={Object.keys(CRI()).map(i => ({ value: i, label: i }))}
                multi={false}
                onChange={(_: any, values: any) => handleChangeLv1(values)}
              />
            </div>
            <div className="w-100 mv6">
              <Dropdown
                disabled={isLoading}
                placeholder="Cantón"
                multi={false}
                value={valueLv2}
                options={optionsLv2}
                onChange={(_: any, values: any) => handleChangeLv2(values)}
              />
            </div>
            <div className="w-100 mv6">
              <Dropdown
                disabled={isLoading}
                placeholder="Distrito"
                multi={false}
                value={valueLv3}
                options={optionsLv3}
                onChange={(_: any, values: any) => handleChangeLv3(values)}
              />
            </div>
          </div>
          {!stores?.length && openOptions ? <div className='pa4'>Lo sentimos no se encontro ninguna tienda cercana, porfavor intentar en otra localidad.</div> : null}
          {(valueLv1 && valueLv2 && valueLv3 && stores?.length && openOptions) ?
            < div className="nowrap">
              <div className='tiendas-cercanas'>Tiendas Cercanas</div>
              <RadioGroup
                disabled={isLoading}
                name="status"
                options={radios}
                value={state}
                onChange={(e: { currentTarget: { value: React.SetStateAction<string> } }) => setState(e.currentTarget.value)}
              />
            </div>
            : null
          }
        </Modal>
      </div>
    </React.Fragment>
  )
}

export default StoreSelector
