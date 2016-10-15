/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
} from 'react-native';
import FacebookBarBehavior from './Lib/FacebookBarBehavior'

export default class FlexHeader extends Component {

  constructor(props) {
    super(props)
    this.state = {
      animation: new Animated.Value(0)
    }
    this.FacebookBarBehavior = new FacebookBarBehavior({
      snappingPositions: [
        {
          progress: 0.0,
          start: 0.0,
          end: 0.5,
        },
        {
          progress: 1.0,
          start: 0.5,
          end: 1.0,
        },
      ],
      snappingEnabled: true,
      thresholdNegativeDirection: 140.0,
      animation: this.state.animation,
      onProgress: (progress) => this._onProgress(progress)
    })

    this._onScrollBeginDrag = (({nativeEvent}) => {
      //console.log('-------onScrollBeginDrag-------', nativeEvent)
      this.FacebookBarBehavior.scrollViewWillBeginDragging(nativeEvent)

    }).bind(this)

    this._onScrollEndDrag = (({nativeEvent}) => {
      //console.log('-------onScrollBeginDrag-------', nativeEvent)
      this.FacebookBarBehavior.snapWithScrollView(nativeEvent)

    }).bind(this)


    this._onScroll = (({nativeEvent}) => {
      //console.log('-------onScroll-------', nativeEvent)
      this.FacebookBarBehavior.scrollViewDidScroll(nativeEvent)
    }).bind(this)

    this._onProgress = ((progress) => {
      console.log(progress);
      this.state.animation.setValue(progress)
    }).bind(this)
  }

  render() {
    const NAVBAR_HEIGHT = 105
    const style = {
      backgroundColor: 'blue',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: NAVBAR_HEIGHT,
      transform: [
        {translateY: this.state.animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -NAVBAR_HEIGHT],
        })},
      ]
    }

    return (
      <View style={{flex: 1}}>
        <ScrollView
          style={{paddingTop: NAVBAR_HEIGHT}}
          ref={ScrollView => this.scrollView = ScrollView}
          scrollEventThrottle={16}
          onScrollBeginDrag={this._onScrollBeginDrag}
          onScrollEndDrag={this._onScrollEndDrag}
          onMomentumScrollEnd={this._onScrollEndDrag}
          onScroll={this._onScroll}
        >
          <View style={styles.container}>
            <Text style={styles.welcome}>
              Welcome to React Native!
            </Text>
            <Text style={styles.instructions}>
              To get started, edit index.ios.js
            </Text>
            <Text style={styles.instructions}>
              Press Cmd+R to reload,{'\n'}
              Cmd+D or shake for dev menu
            </Text>
          </View>
        </ScrollView>
        <Animated.View style={style}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    height: 6000,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('FlexHeader', () => FlexHeader);
