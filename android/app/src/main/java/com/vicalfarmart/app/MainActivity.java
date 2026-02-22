package com.vicalfarmart.app;

import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
add(GoogleAuth.class);
}});
}
