(function () {
    'use strict';

    /**
     * @param {typeof Number} Number
     * @param {app.utils} utils
     * @param {Waves} waves
     * @return {Asset}
     */
    const factory = function (Number, utils, waves) {

        class Asset extends Number {

            constructor(params) {
                super(params);

                /**
                 * @type {string}
                 */
                this.assetId = this.$attrs.assetId;
                if (!this.assetId) {
                    throw new Error('Has no asset id attribute for asset validator');
                }

                this.onReady()
                    .then((asset) => {
                        /**
                         * @type {IAssetInfo}
                         */
                        this.asset = asset;

                        this.registerValidator('asset-input', (modelValue, viewValue) => {
                            const parts = String(viewValue || 0)
                                .replace(',', '')
                                .split('.');
                            if (!modelValue) {
                                return 'required' in this.$attrs;
                            }
                            return (!parts[1] || parts[1].length <= asset.precision);
                        });

                        if (this.$attrs.max) {
                            let balance;

                            this.registerValidator('asset-max', (modelValue) => {
                                if (!balance) {
                                    return true;
                                } else {
                                    return modelValue && modelValue.lte(balance.getTokens());
                                }
                            });

                            this.$scope.$watch(this.$attrs.max, (value) => {
                                balance = value;
                                this.validateByName('asset-max');
                            });
                        }
                    });
            }

            getFormatter() {
                return (value) => utils.getNiceNumber(value, this.asset.precision);
            }

            onReady() {
                return super.onReady()
                    .then(() => waves.node.assets.info(this.assetId));
            }

        }

        return Asset;
    };

    factory.$inject = ['Number', 'utils', 'waves'];

    angular.module('app.utils')
        .factory('Asset', factory);
})();