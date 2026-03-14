
package com.vicalfarmart.app;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Install the splash screen transition BEFORE calling super.onCreate
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
    }
}
