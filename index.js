// module.exports = require('./lib/tlc');

var tlc = require('./lib/tlc');

// var headers = {
//   input: [
//     // 'TRX_SOURCE',
//     // 'TRX_TYPE',
//     'TRL_SF_COUNTRY_CODE',
//     // 'TRL_SF_WHSE',
//     // 'TRL_SDF_COUNTRY_CODE',
//     // 'TRX_SDT_COUNTRY_CODE',
//     // 'TRL_BT_COUNTRY_CODE',
//     'TRL_ST_COUNTRY_CODE',
//     // 'TRL_FOB_POINT_CODE',
//     // 'SHIP_VIA'
//   ],
//   output: [
//     // 'ZONE_NAME',
//     'TAX_RATE_CODE',
//     // 'TAX_TYPE',
//     // 'TAX_RATE',
//     // 'TAXABLE_BASIS',
//     // 'TAXABLE_COUNTRY',
//     // 'JURISDICTION_TEXT',
//     // 'ERP_TAX_CODE',
//     // 'IS_TRIANGULATION',
//     // 'IS_EXEMPT',
//     // 'EU_TRANSACTION',
//     // 'AUTHORITY_NAME',
//     // 'AUTHORITY_TYPE',
//     // 'BASIS_PERCENT',
//     // 'ADDRESS_TYPE',
//     // 'TRLT_TAX_CODE'
//   ]
// };

tlc.init('./test_data.csv', 'liked', ['color', 'shape']);

console.log(tlc.classify({
  color: 'pink',
  shape: 'ball'
}));