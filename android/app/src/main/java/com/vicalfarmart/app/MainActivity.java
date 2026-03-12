package com.vicalfarmart.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import io.capawesome.capacitor.firebase.auth.FirebaseAuthenticationPlugin;
import com.getcapacitor.community.barcodescanner.BarcodeScannerPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Registering plugins manually to resolve "not implemented" errors
        registerPlugin(FirebaseAuthenticationPlugin.class);
        registerPlugin(BarcodeScannerPlugin.class);
    }
}
