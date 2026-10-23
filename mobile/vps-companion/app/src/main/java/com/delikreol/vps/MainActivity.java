package com.delikreol.vps;

import android.app.*;
import android.os.*;
import android.content.*;
import android.graphics.Typeface;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.text.InputType;
import android.view.*;
import android.widget.*;
import android.util.Base64;
import com.jcraft.jsch.*;
import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.concurrent.*;

public class MainActivity extends Activity {
    private static final String KEY_ALIAS="delikreol-vps-key-encryption";
    private final ExecutorService worker=Executors.newSingleThreadExecutor();
    private EditText host,user,port,fingerprint;
    private TextView log,keyText;
    private Button keyButton;
    private String privateKey="", publicKey="";
    private final int purple=0xff6541d7;

    @Override public void onCreate(Bundle b){super.onCreate(b); buildUi(); loadKey();}
    private void buildUi(){
        ScrollView sc=new ScrollView(this); LinearLayout page=new LinearLayout(this);page.setOrientation(1);page.setPadding(dp(20),dp(28),dp(20),dp(24));page.setBackgroundColor(0xfff6f5fa);sc.addView(page);
        TextView title=new TextView(this);title.setText("DELIKREOL VPS");title.setTextSize(27);title.setTypeface(null,Typeface.BOLD);title.setTextColor(0xff211a36);page.addView(title);
        TextView intro=new TextView(this);intro.setText("Connexion SSH protégée · actions DELIKREOL en lecture seule");intro.setTextSize(14);intro.setPadding(0,dp(5),0,dp(20));page.addView(intro);
        host=field(page,"Hôte VPS (DELIKREOL)","srv1729857.hstgr.cloud");user=field(page,"Utilisateur SSH","root");port=field(page,"Port SSH","22");port.setInputType(InputType.TYPE_CLASS_NUMBER);
        fingerprint=field(page,"Empreinte SHA256 de l’hôte (obligatoire)","");
        TextView hint=new TextView(this);hint.setText("Sur le VPS : ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub -E sha256. Vérifie l’empreinte dans Hostinger avant de la saisir.");hint.setTextSize(12);hint.setPadding(0,0,0,dp(12));page.addView(hint);
        keyButton=button("Créer une clé sécurisée sur ce téléphone");page.addView(keyButton);keyButton.setOnClickListener(v->generateKey());
        keyText=new TextView(this);keyText.setTextSize(11);keyText.setTextIsSelectable(true);keyText.setPadding(dp(8),dp(8),dp(8),dp(8));page.addView(keyText);
        Button copy=button("Copier la clé publique pour Hostinger");page.addView(copy);copy.setOnClickListener(v->{if(publicKey.isEmpty())toast("Crée d’abord une clé");else{((android.content.ClipboardManager)getSystemService(CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("Clé publique VPS",publicKey));toast("Clé copiée. Ajoute-la dans Hostinger → SSH keys.");}});
        Button connect=button("Tester la connexion SSH");page.addView(connect);connect.setOnClickListener(v->runSsh("Connexion SSH vérifiée avec succès.",false));
        TextView sec=new TextView(this);sec.setText("Actions DELIKREOL");sec.setTextSize(18);sec.setTypeface(null,Typeface.BOLD);sec.setPadding(0,dp(18),0,dp(6));page.addView(sec);
        action(page,"État du site", "curl -sS -o /dev/null -w 'DELIKREOL HTTP %{http_code} · %{time_total}s\\n' --max-time 15 https://delikreol.com");
        action(page,"État du conteneur", "docker ps --filter name=delikreol-web --format '{{.Names}} · {{.Status}}'");
        action(page,"Modèles IA locaux", "docker exec ollama-gsz1-ollama-1 ollama list");
        action(page,"Vérifier DELIKREOL (tests)", "cd /opt/vlad/projects/DELIKREOL && npm run typecheck && npm test -- --reporter=dot");
        log=new TextView(this);log.setText("Prêt. Génère une clé puis ajoute sa clé publique au VPS depuis Hostinger.");log.setTextSize(13);log.setTextColor(0xffe9e7f0);log.setPadding(dp(12),dp(12),dp(12),dp(12));log.setBackgroundColor(0xff171326);LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,dp(190));lp.topMargin=dp(18);page.addView(log,lp);setContentView(sc);
    }
    private EditText field(LinearLayout p,String label,String value){TextView t=new TextView(this);t.setText(label);t.setTextSize(13);t.setTypeface(null,Typeface.BOLD);t.setPadding(0,dp(5),0,dp(3));p.addView(t);EditText e=new EditText(this);e.setSingleLine(true);e.setText(value);e.setTextSize(15);e.setPadding(dp(12),0,dp(12),0);p.addView(e,new LinearLayout.LayoutParams(-1,dp(50)));return e;}
    private Button button(String s){Button b=new Button(this);b.setText(s);b.setTextColor(-1);b.setAllCaps(false);b.setBackgroundTintList(android.content.res.ColorStateList.valueOf(purple));LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,dp(50));lp.topMargin=dp(8);b.setLayoutParams(lp);return b;}
    private void action(LinearLayout p,String label,String command){Button b=button(label);p.addView(b);b.setOnClickListener(v->runSsh(command,true));}
    private int dp(int n){return (int)(n*getResources().getDisplayMetrics().density+.5f);}
    private void toast(String s){Toast.makeText(this,s,Toast.LENGTH_LONG).show();}

    private SecretKey encryptionKey() throws Exception {KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);if(ks.containsAlias(KEY_ALIAS))return (SecretKey)ks.getKey(KEY_ALIAS,null);KeyGenerator g=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");g.init(new KeyGenParameterSpec.Builder(KEY_ALIAS,KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());return g.generateKey();}
    private void saveKey(String text) throws Exception {javax.crypto.Cipher c=javax.crypto.Cipher.getInstance("AES/GCM/NoPadding");c.init(javax.crypto.Cipher.ENCRYPT_MODE,encryptionKey());byte[] iv=c.getIV(), enc=c.doFinal(text.getBytes(StandardCharsets.UTF_8));String stored=Base64.encodeToString(iv,Base64.NO_WRAP)+":"+Base64.encodeToString(enc,Base64.NO_WRAP);getSharedPreferences("vault",0).edit().putString("key",stored).apply();}
    private String readKey() throws Exception {String s=getSharedPreferences("vault",0).getString("key","");if(s.isEmpty())return "";String[] a=s.split(":",2);javax.crypto.Cipher c=javax.crypto.Cipher.getInstance("AES/GCM/NoPadding");c.init(javax.crypto.Cipher.DECRYPT_MODE,encryptionKey(),new GCMParameterSpec(128,Base64.decode(a[0],Base64.NO_WRAP)));return new String(c.doFinal(Base64.decode(a[1],Base64.NO_WRAP)),StandardCharsets.UTF_8);}
    private void loadKey(){try{String s=readKey(), delimiter="\n---PUBLIC---\n";int cut=s.indexOf(delimiter);if(cut>0){privateKey=s.substring(0,cut);publicKey=s.substring(cut+delimiter.length());showPub();}}catch(Exception e){getSharedPreferences("vault",0).edit().clear().apply();}}
    private void generateKey(){keyButton.setEnabled(false);worker.execute(()->{try{JSch j=new JSch();com.jcraft.jsch.KeyPair kp=com.jcraft.jsch.KeyPair.genKeyPair(j,com.jcraft.jsch.KeyPair.RSA,3072);ByteArrayOutputStream prv=new ByteArrayOutputStream(),pub=new ByteArrayOutputStream();kp.writePrivateKey(prv);kp.writePublicKey(pub,"DELIKREOL mobile");kp.dispose();String p=new String(prv.toByteArray(),StandardCharsets.UTF_8),q=new String(pub.toByteArray(),StandardCharsets.UTF_8).trim();saveKey(p+"\n---PUBLIC---\n"+q);runOnUiThread(()->{privateKey=p;publicKey=q;showPub();toast("Clé créée et chiffrée par Android Keystore.");keyButton.setEnabled(true);});}catch(Exception e){runOnUiThread(()->{toast("Création de clé impossible : "+e.getMessage());keyButton.setEnabled(true);});}});}
    private void showPub(){keyText.setText(publicKey.isEmpty()?"Aucune clé créée":publicKey);}
    private void runSsh(String command,boolean action){String h=host.getText().toString().trim(),u=user.getText().toString().trim(),fp=fingerprint.getText().toString().trim();int pr;try{pr=Integer.parseInt(port.getText().toString().trim());}catch(Exception e){toast("Port invalide");return;}if(h.isEmpty()||u.isEmpty()||fp.isEmpty()){toast("Renseigne l’hôte, l’utilisateur et l’empreinte SHA256 vérifiée");return;}if(privateKey.isEmpty()){toast("Crée d’abord une clé SSH sur le téléphone");return;}log.setText("Connexion sécurisée en cours…");worker.execute(()->{Session session=null;ChannelExec ch=null;try{JSch j=new JSch();byte[] pk=privateKey.getBytes(StandardCharsets.UTF_8);j.addIdentity("phone-key",pk,null,null);session=j.getSession(u,h,pr);session.setConfig("StrictHostKeyChecking","yes");session.setHostKeyRepository(new PinnedHostKeyRepository(j,fp));session.connect(12000);if(action){ch=(ChannelExec)session.openChannel("exec");ch.setCommand(command);ch.setInputStream(null);ByteArrayOutputStream out=new ByteArrayOutputStream(),err=new ByteArrayOutputStream();ch.setOutputStream(out);ch.setErrStream(err);ch.connect(10000);long until=System.currentTimeMillis()+120000;while(!ch.isClosed()&&System.currentTimeMillis()<until)Thread.sleep(150);String res=out.toString("UTF-8");if(res.isEmpty())res=err.toString("UTF-8");String finalRes=res.isEmpty()?"Commande terminée, code "+ch.getExitStatus():res;String display=finalRes;runOnUiThread(()->log.setText(display));}else runOnUiThread(()->log.setText("Connexion vérifiée.\nHôte : "+h+"\nUtilisateur : "+u));}catch(Exception e){String msg="Échec SSH : "+e.getMessage();runOnUiThread(()->log.setText(msg));}finally{if(ch!=null)ch.disconnect();if(session!=null)session.disconnect();}});}
    private static class PinnedHostKeyRepository implements HostKeyRepository {private final String pin;PinnedHostKeyRepository(JSch j,String pin){this.pin=pin;}public int check(String host,byte[] key){try{String actual="SHA256:"+Base64.encodeToString(MessageDigest.getInstance("SHA-256").digest(key),Base64.NO_PADDING|Base64.NO_WRAP);return MessageDigest.isEqual(actual.getBytes(StandardCharsets.UTF_8),pin.getBytes(StandardCharsets.UTF_8))?OK:CHANGED;}catch(Exception e){return CHANGED;}}public void add(HostKey k,UserInfo u){}public void remove(String h,String t){}public void remove(String h,String t,byte[] k){}public String getKnownHostsRepositoryID(){return "pinned-sha256";}public HostKey[] getHostKey(){return new HostKey[0];}public HostKey[] getHostKey(String h,String t){return new HostKey[0];}}
    @Override protected void onDestroy(){worker.shutdownNow();super.onDestroy();}
}

