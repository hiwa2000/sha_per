import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';


void main() {
  runApp(MyApp());
}

class ThemeManager {
  final String themeKey = 'theme';

  Future<void> setTheme(bool isDark) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setBool(themeKey, isDark);
  }

  Future<bool> getTheme() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getBool(themeKey) ?? false; // Default to light theme if not set
  }
}

class MyApp extends StatelessWidget {
  final ThemeManager _themeManager = ThemeManager();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _themeManager.getTheme(),
      builder: (context, snapshot) {
        bool isDark = snapshot.data ?? false;

        return MaterialApp(
          theme: isDark ? ThemeData.dark() : ThemeData.light(),
          home: HomeScreen(_themeManager),
        );
      },
    );
  }
}

class HomeScreen extends StatefulWidget {
  final ThemeManager _themeManager;

  HomeScreen(this._themeManager);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool isDark = false;

  @override
  void initState() {
    super.initState();
    _loadTheme();
  }

  void _loadTheme() async {
    bool theme = await widget._themeManager.getTheme();
    setState(() {
      isDark = theme;
    });
  }

  void _toggleTheme() async {
    bool newTheme = !isDark;
    await widget._themeManager.setTheme(newTheme);
    setState(() {
      isDark = newTheme;
    });

    // Nach dem Ändern des Themas wird das Widget neu erstellt
    // Dies führt zu einer sofortigen Aktualisierung des Themas
    runApp(MyApp());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Theme Toggle Example'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Toggle between Dark and Light Themes:'),
            Switch(
              value: isDark,
              onChanged: (value) {
                _toggleTheme();
              },
            ),
            ElevatedButton(
              onPressed: () {
                _toggleTheme();
              },
              child: Text('Toggle Theme'),
            ),
          ],
        ),
      ),
    );
  }
}
