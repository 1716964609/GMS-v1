# 個人系無料サービス　翻訳用語管理システム 兼　エンジニア就活ポートフォリオ

## 概要
サイトURL: [sunlightjetrans.com](https://sunlightjetrans.com)

テスト用 管理者アカウント

ユーザー名: adminofslt@outlook.jp

パスワード: adminofslt 

翻訳用語管理システムは、フリーランス翻訳者向けに開発された、用語の検索・管理システムです。このシステムは日本語と英語の翻訳用語を効率的に検索できるよう設計されています。シンプルなUIと高速な検索機能を特徴とし、年に1〜2回のデータ更新を前提としています。

## 主な機能
- **ユーザー機能**
  - 用語の検索・閲覧
  - 用語リストの閲覧
- **管理者機能**
  - 用語とリストの作成、編集、削除（CRUD）
  - 用語のバージョン管理
  - データの年次更新

## 技術スタック
- **バックエンド**: Java (Spring Boot)
- **フロントエンド**: HTML, CSS, Javascript
- **データベース**: MySQL
- **ホスティング**: AWS EC2, RDS
- **ロードバランサー**: Nginx
- **セキュリティ**: Spring Security, CSRFトークン, HTTPS（Let’s Encrypt）

## システム設計
このシステムは3つの主要テーブル（`Users`, `Terms`, `Lists`）を持ち、それぞれユーザー情報や翻訳用語を管理します。また、バージョン管理機能が組み込まれており、用語とリストの変更履歴を追跡できます。

## 使用方法
1. **ユーザー登録**: 新規ユーザーはランディングページからアカウントを作成可能。
2. **ログイン**: 登録済みユーザーはメールアドレスとパスワードでログイン。
3. **用語検索**: ログイン後、用語を検索・閲覧。
4. **管理者機能**: 管理者はコンソールページから用語とリストを管理。
