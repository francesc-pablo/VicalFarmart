package com.vicalfarmart.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // This makes the webview background transparent
    // so the camera preview can be seen behind it.
    this.bridge.getWebView().setBackgroundColor(0x00000000);
  }
}
