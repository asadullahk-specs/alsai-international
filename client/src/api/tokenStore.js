let customerAccessToken = null;
let adminAccessToken = null;

export const getCustomerAccessToken = () => customerAccessToken;
export const setCustomerAccessToken = (token) => {
  customerAccessToken = token;
};

export const getAdminAccessToken = () => adminAccessToken;
export const setAdminAccessToken = (token) => {
  adminAccessToken = token;
};
