package com.vicalfarmart.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.community.barcodescanner.BarcodeScanner;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Explicitly register the scanner plugin to resolve the "not implemented" error
        registerPlugin(BarcodeScanner.class);
    }
}
