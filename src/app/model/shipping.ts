import {Injectable} from 'angular2/core';
import {MagentoService} from '../services/magento.service';
import {Cart} from './cart';
import {ShippingMethod} from '../typings/shipping-method';
import {Payment} from './payment';
import {Address} from '../typings/adress';

@Injectable()
export class Shipping {
  selectedMethod: ShippingMethod;
  selectedAddress: Address = {
    region    : '',
    regionId  : 0,
    countryId : 'nz',
    postcode  : '',
    street    : ['', ''],
    telephone : '',
    city      : '',
    firstname : '',
    lastname  : '',
    methodCode: '',
    carrayCode: '',
    company   : ''
  };
  availableMethods: Array<ShippingMethod>;

  constructor(private _magento: MagentoService, private _cart: Cart, private _payment: Payment) {
  }

  getShippingMethodsByAddr(): Promise<any> {

    return new Promise(resolve => {
      this._cart.getCardId().then(cartId => {
        this._magento.getSwaggerClient().then(api => {
          api.quoteGuestShippingMethodManagementV1.quoteGuestShippingMethodManagementV1EstimateByAddressPost({

            cartId: cartId,
            $body : {
              address: {
                region   : this.selectedAddress.region,
                countryId: this.selectedAddress.countryId,
                postcode : this.selectedAddress.postcode,
              }
            }

          }).then((data: any) => {

            console.log('Shipping methods: ', data.obj);
            this.availableMethods = data.obj;
            resolve(this.availableMethods);

          });
        });
      });
    });

  }

  saveShippingInfoAndGetPaymentMethods(): Promise<any> {

    return new Promise(resolve => {
      this._cart.getCardId().then(cartId => {
        this._magento.getSwaggerClient().then(api => {
          api.checkoutGuestShippingInformationManagementV1.checkoutGuestShippingInformationManagementV1SaveAddressInformationPost({
            cartId: cartId,
            $body : {
              addressInformation: {
                shippingAddress    : this.selectedAddress,
                billingAddress     : this.selectedAddress,
                shippingMethodCode : this.selectedMethod.method_code,
                shippingCarrierCode: this.selectedMethod.carrier_code
              }
            }
          }).then((data: any) => {

            console.log('Available Payment Methods: ', data.obj);

            this._payment.availableMethods = data.obj.payment_methods;
            this._cart.totals = data.obj.totals;

          });
        });
      });
    });

  }
}
