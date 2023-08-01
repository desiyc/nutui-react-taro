import { Provider } from "react-redux";
import "./app.scss";
import { initModels, initRequest } from "./utils/dva17-taro";
import models from "./models";
import "@nutui/nutui-react-taro/dist/style.css";
import config from "./common/config";
import Taro from "@tarojs/taro";
const storeInstance: any = initModels(models, false);

initRequest(
  config.SERVER_HOME,
  ({ code, message }) => {
    if (401 == code) {
    } else {
      console.warn(message); //TODO.请求异常
      Taro.showToast({
        title: message,
        icon: "none",
      });
    }
  },
  true
);
export default ({ children }) => {
  return <Provider store={storeInstance}>{children}</Provider>;
};
