import React from "react";
import { View } from "@tarojs/components";

import "./index.scss";
import { Button } from "@nutui/nutui-react-taro";

export default function() {
  return (
    <View>
      <Button size="large" type="primary">
        按钮
      </Button>
    </View>
  );
}
